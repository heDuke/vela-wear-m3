# v3 参考图来源（下载于 2026-10-22，UTC+8）

## androidx 截图测试 golden（Apache-2.0）
前缀：`https://android.googlesource.com/platform/frameworks/support-golden/+/refs/heads/androidx-main/wear/compose/compose-material3/<文件名>`（加 `?format=TEXT` 得到 base64 原图）
完整文件名清单：`golden_names.txt`（1283 个）。本目录下载了：
- alertContent_icon_title_confirmDismissButtons_LARGE_SLC_emulator.png、alertContent_icon_title_messageText_*、alert_title_confirmDismissButtons_LARGE_emulator.png
- successConfirmation_icon_text_LARGE_emulator.png、successConfirmation_icon_noText_LARGE_emulator.png、confirmation_icon_curvedText_LARGE_emulator.png、confirmation_icon_linearText_LARGE_emulator.png
- edge_button_{xsmall,small,medium,large}_icon_emulator.png、edge_button_default_emulator.png
- time_text_with_clock_only_on_round_device_emulator.png、time_text_with_clock_only_on_non_round_device_emulator.png
- position_indicator_round_*（ScrollIndicator）
- transforming_lazy_column_*（TLC 边缘缩放）
- filled_tonal_button_icon_and_label_start_aligned_emulator.png、filled_tonal_icon_button_enabled_emulator.png、filled_icon_button_enabled_emulator.png、listheader_emulator.png
Golden 像素密度：LARGE = 599px / 228dp（2.625）；edge_button_* = 504px / 192dp（2.625）。

## developer.android.com（CC BY 4.0）
- `https://developer.android.com/static/wear/images/design/{edge-hugging-containers,corner-radius,shape-applied,type-roles,roboto-flex}.png` → devsite_m3_*.png（页面：https://developer.android.com/design/ui/wear/guides/get-started/design-language）
- `https://developer.android.com/static/wear/images/design/shape-and-motion.mp4` 第 3 秒截帧 → devsite_design-language_shape-and-motion_frame_*.png
- `https://developer.android.com/static/wear/images/lists/lists-hero.png` 等 → devsite_lists-*.png（注意：/design/ui/wear/guides/components/* 现已重定向到 m2-5，属 M2.5 时代配图）

## 源码令牌（读取的文件放在 ../tokens/）
`https://raw.githubusercontent.com/androidx/androidx/androidx-main/wear/compose/compose-material3/src/main/java/androidx/wear/compose/material3/`：
tokens/ColorTokens.kt、PaletteTokens.kt、TypeScaleTokens.kt、TypographyTokens.kt、ShapeTokens.kt、CardTokens.kt、FilledTonalButtonTokens.kt、FilledButtonTokens.kt、ListHeaderTokens.kt、TypefaceTokens.kt、IconButtonTokens.kt、CompactButtonTokens.kt；
EdgeButton.kt、ScreenScaffold.kt、Button.kt、AlertDialog.kt、ConfirmationDialog.kt、TimeText.kt、ScrollIndicator.kt、Padding.kt、ListHeader.kt、CurvedText.kt、lazy/ResponsiveTransformationSpec.kt、lazy/TransitionAreaProgress.kt、lazy/TransformationSpec.kt

## 字体
- Google Sans Flex（OFL）：https://github.com/google/fonts/tree/main/ofl/googlesansflex → ../fonts/GoogleSansFlex.ttf
- Roboto Flex（OFL，androidx TypefaceTokens 指定 "roboto-flex"）→ ../fonts/RobotoFlex.ttf（备用，未用于截图）
