import type { Config } from "tailwindcss"
import { join } from "path";
import { skeleton } from "@skeletonlabs/tw-plugin";
import { fabricateSkeletonTheme } from "./fabricate-skeleton-theme"

export default {
    important: "#fab-tw-application-container",
    content: [
        "./src/**/*.{svelte,ts}",
        join(require.resolve(
                "@skeletonlabs/skeleton"),
            "../**/*.{html,js,svelte,ts}"
        )
    ],
    theme: {
        extend: {},
    },
    plugins: [
        skeleton({
            base: false,
            themes: {
                custom: [ fabricateSkeletonTheme ]
            }
        })
    ],
    corePlugins: {
        preflight: false,
    }
} satisfies Config
