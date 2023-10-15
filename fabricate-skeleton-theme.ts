
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const fabricateSkeletonTheme: CustomThemeConfig = {
    name: 'fabricate-skeleton-theme',
    properties: {
        // =~= Theme Properties =~=
        "--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        "--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        "--theme-font-color-base": "0 0 0",
        "--theme-font-color-dark": "255 255 255",
        "--theme-rounded-base": "9999px",
        "--theme-rounded-container": "8px",
        "--theme-border-base": "1px",
        // =~= Theme On-X Colors =~=
        "--on-primary": "0 0 0",
        "--on-secondary": "0 0 0",
        "--on-tertiary": "0 0 0",
        "--on-success": "0 0 0",
        "--on-warning": "0 0 0",
        "--on-error": "255 255 255",
        "--on-surface": "255 255 255",
        // =~= Theme Colors  =~=
        // primary | #ac9e6c
        "--color-primary-50": "243 240 233", // #f3f0e9
        "--color-primary-100": "238 236 226", // #eeece2
        "--color-primary-200": "234 231 218", // #eae7da
        "--color-primary-300": "222 216 196", // #ded8c4
        "--color-primary-400": "197 187 152", // #c5bb98
        "--color-primary-500": "172 158 108", // #ac9e6c
        "--color-primary-600": "155 142 97", // #9b8e61
        "--color-primary-700": "129 119 81", // #817751
        "--color-primary-800": "103 95 65", // #675f41
        "--color-primary-900": "84 77 53", // #544d35
        // secondary | #bc9276
        "--color-secondary-50": "245 239 234", // #f5efea
        "--color-secondary-100": "242 233 228", // #f2e9e4
        "--color-secondary-200": "238 228 221", // #eee4dd
        "--color-secondary-300": "228 211 200", // #e4d3c8
        "--color-secondary-400": "208 179 159", // #d0b39f
        "--color-secondary-500": "188 146 118", // #bc9276
        "--color-secondary-600": "169 131 106", // #a9836a
        "--color-secondary-700": "141 110 89", // #8d6e59
        "--color-secondary-800": "113 88 71", // #715847
        "--color-secondary-900": "92 72 58", // #5c483a
        // tertiary | #8f68df
        "--color-tertiary-50": "238 232 250", // #eee8fa
        "--color-tertiary-100": "233 225 249", // #e9e1f9
        "--color-tertiary-200": "227 217 247", // #e3d9f7
        "--color-tertiary-300": "210 195 242", // #d2c3f2
        "--color-tertiary-400": "177 149 233", // #b195e9
        "--color-tertiary-500": "143 104 223", // #8f68df
        "--color-tertiary-600": "129 94 201", // #815ec9
        "--color-tertiary-700": "107 78 167", // #6b4ea7
        "--color-tertiary-800": "86 62 134", // #563e86
        "--color-tertiary-900": "70 51 109", // #46336d
        // success | #7cc567
        "--color-success-50": "235 246 232", // #ebf6e8
        "--color-success-100": "229 243 225", // #e5f3e1
        "--color-success-200": "222 241 217", // #def1d9
        "--color-success-300": "203 232 194", // #cbe8c2
        "--color-success-400": "163 214 149", // #a3d695
        "--color-success-500": "124 197 103", // #7cc567
        "--color-success-600": "112 177 93", // #70b15d
        "--color-success-700": "93 148 77", // #5d944d
        "--color-success-800": "74 118 62", // #4a763e
        "--color-success-900": "61 97 50", // #3d6132
        // warning | #ecc44b
        "--color-warning-50": "252 246 228", // #fcf6e4
        "--color-warning-100": "251 243 219", // #fbf3db
        "--color-warning-200": "250 240 210", // #faf0d2
        "--color-warning-300": "247 231 183", // #f7e7b7
        "--color-warning-400": "242 214 129", // #f2d681
        "--color-warning-500": "236 196 75", // #ecc44b
        "--color-warning-600": "212 176 68", // #d4b044
        "--color-warning-700": "177 147 56", // #b19338
        "--color-warning-800": "142 118 45", // #8e762d
        "--color-warning-900": "116 96 37", // #746025
        // error | #ab3f45
        "--color-error-50": "242 226 227", // #f2e2e3
        "--color-error-100": "238 217 218", // #eed9da
        "--color-error-200": "234 207 209", // #eacfd1
        "--color-error-300": "221 178 181", // #ddb2b5
        "--color-error-400": "196 121 125", // #c4797d
        "--color-error-500": "171 63 69", // #ab3f45
        "--color-error-600": "154 57 62", // #9a393e
        "--color-error-700": "128 47 52", // #802f34
        "--color-error-800": "103 38 41", // #672629
        "--color-error-900": "84 31 34", // #541f22
        // surface | #504e54
        "--color-surface-50": "229 228 229", // #e5e4e5
        "--color-surface-100": "220 220 221", // #dcdcdd
        "--color-surface-200": "211 211 212", // #d3d3d4
        "--color-surface-300": "185 184 187", // #b9b8bb
        "--color-surface-400": "133 131 135", // #858387
        "--color-surface-500": "80 78 84", // #504e54
        "--color-surface-600": "72 70 76", // #48464c
        "--color-surface-700": "60 59 63", // #3c3b3f
        "--color-surface-800": "48 47 50", // #302f32
        "--color-surface-900": "39 38 41", // #272629

    }
}