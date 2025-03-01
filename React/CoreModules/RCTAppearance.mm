/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RCTAppearance.h"

#import <FBReactNativeSpec/FBReactNativeSpec.h>
#import <React/RCTConstants.h>
#import <React/RCTEventEmitter.h>

#import "CoreModulesPlugins.h"

using namespace facebook::react;

NSString *const RCTAppearanceColorSchemeLight = @"light";
NSString *const RCTAppearanceColorSchemeDark = @"dark";

static BOOL sAppearancePreferenceEnabled = YES;
void RCTEnableAppearancePreference(BOOL enabled)
{
  sAppearancePreferenceEnabled = enabled;
}

static NSString *sColorSchemeOverride = nil;
void RCTOverrideAppearancePreference(NSString *const colorSchemeOverride)
{
  sColorSchemeOverride = colorSchemeOverride;
}

#if !TARGET_OS_OSX // TODO(macOS GH#774)
static NSString *RCTColorSchemePreference(UITraitCollection *traitCollection)
{
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_0) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_0
  if (@available(iOS 13.0, *)) {
    static NSDictionary *appearances;
    static dispatch_once_t onceToken;

    if (sColorSchemeOverride) {
      return sColorSchemeOverride;
    }

    dispatch_once(&onceToken, ^{
      appearances = @{
        @(UIUserInterfaceStyleLight) : RCTAppearanceColorSchemeLight,
        @(UIUserInterfaceStyleDark) : RCTAppearanceColorSchemeDark
      };
    });

    if (!sAppearancePreferenceEnabled) {
      // Return the default if the app doesn't allow different color schemes.
      return RCTAppearanceColorSchemeLight;
    }

    traitCollection = traitCollection ?: [UITraitCollection currentTraitCollection];
    return appearances[@(traitCollection.userInterfaceStyle)] ?: RCTAppearanceColorSchemeLight;
  }
#endif

  // Default to light on older OS version - same behavior as Android.
  return RCTAppearanceColorSchemeLight;
}
#else // [TODO(macOS GH#774)
static NSString *RCTColorSchemePreference(NSAppearance *appearance)
{
  if (@available(macOS 10.14, *)) {
    static NSDictionary *appearances;
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
      appearances = @{
                      NSAppearanceNameAqua: RCTAppearanceColorSchemeLight,
                      NSAppearanceNameDarkAqua: RCTAppearanceColorSchemeDark
                      };
    });

    if (!sAppearancePreferenceEnabled) {
      // Return the default if the app doesn't allow different color schemes.
      return RCTAppearanceColorSchemeLight;
    }

    appearance = appearance ?: [NSAppearance currentAppearance];
    NSAppearanceName appearanceName = [appearance bestMatchFromAppearancesWithNames:@[NSAppearanceNameAqua, NSAppearanceNameDarkAqua]];
    return appearances[appearanceName] ?: RCTAppearanceColorSchemeLight;
  }

  // Default to light on older OS version - same behavior as Android.
  return RCTAppearanceColorSchemeLight;
}
#endif // ]TODO(macOS GH#774)

@interface RCTAppearance () <NativeAppearanceSpec>
@end

@implementation RCTAppearance {
  NSString *_currentColorScheme;
}

RCT_EXPORT_MODULE(Appearance)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (std::shared_ptr<TurboModule>)getTurboModuleWithJsInvoker:(std::shared_ptr<CallInvoker>)jsInvoker
                                              nativeInvoker:(std::shared_ptr<CallInvoker>)nativeInvoker
                                                 perfLogger:(id<RCTTurboModulePerformanceLogger>)perfLogger
{
  return std::make_shared<NativeAppearanceSpecJSI>(self, jsInvoker, nativeInvoker, perfLogger);
}

#if TARGET_OS_OSX // [TODO(macOS GH#774): on macOS don't lazy init _currentColorScheme because [NSAppearance currentAppearance] cannot be executed on background thread.
- (instancetype)init
{
  if (self = [super init]) {
    _currentColorScheme =  RCTColorSchemePreference(nil);
  }
  return self;
}
#endif // ]TODO(macOS GH#774)

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSString *, getColorScheme)
{
#if !TARGET_OS_OSX // [TODO(macOS GH#774)
  _currentColorScheme = RCTColorSchemePreference(nil);
#endif // ]TODO(macOS GH#774)
  return _currentColorScheme;
}

- (void)appearanceChanged:(NSNotification *)notification
{
  NSDictionary *userInfo = [notification userInfo];
#if !TARGET_OS_OSX // TODO(macOS GH#774)
  UITraitCollection *traitCollection = nil;
  if (userInfo) {
    traitCollection = userInfo[RCTUserInterfaceStyleDidChangeNotificationTraitCollectionKey];
  }
  NSString *newColorScheme = RCTColorSchemePreference(traitCollection);
#else // [TODO(macOS GH#774)
  NSAppearance *appearance = nil;
  if (userInfo) {
    appearance = userInfo[RCTUserInterfaceStyleDidChangeNotificationTraitCollectionKey];
  }
  NSString *newColorScheme = RCTColorSchemePreference(appearance);
#endif // ]TODO(macOS GH#774)
  if (![_currentColorScheme isEqualToString:newColorScheme]) {
    _currentColorScheme = newColorScheme;
    [self sendEventWithName:@"appearanceChanged" body:@{@"colorScheme" : newColorScheme}];
  }
}

#pragma mark - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents
{
  return @[ @"appearanceChanged" ];
}

- (void)startObserving
{
  if (@available(macOS 10.14, iOS 13.0, *)) { // TODO(macOS GH#774)
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appearanceChanged:)
                                                 name:RCTUserInterfaceStyleDidChangeNotification
                                               object:nil];
  }
}

- (void)stopObserving
{
  if (@available(macOS 10.14, iOS 13.0, *)) { // TODO(macOS GH#774)
    [[NSNotificationCenter defaultCenter] removeObserver:self];
  }
}

@end

Class RCTAppearanceCls(void)
{
  return RCTAppearance.class;
}
