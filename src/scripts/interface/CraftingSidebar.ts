interface UIComponent {
    init(): void;
}

class CraftingSidebar implements UIComponent {

    init(): void {
        this.registerHooks();
    }

    private registerHooks(): void {



    }

}

export { CraftingSidebar }