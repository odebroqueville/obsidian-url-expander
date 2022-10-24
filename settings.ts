import { App, PluginSettingTab, Setting } from 'obsidian';
import UrlExpanderPlugin from './main';

export interface UrlExpanderPluginSettings {
    mySetting: string;
    contextMenu: boolean;
}

export const DEFAULT_SETTINGS: UrlExpanderPluginSettings = {
    mySetting: 'default',
    contextMenu: true
};

export class UrlExpanderSettingsTab extends PluginSettingTab {
    plugin: UrlExpanderPlugin;

    constructor(app: App, plugin: UrlExpanderPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Obsidian URL Expander' });

        new Setting(containerEl)
            .setName('File Context Menu')
            .setDesc("Turn this option off if you don't want single file commands to appear within the file context menu")
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.contextMenu).onChange((newVal) => {
                    this.plugin.settings.contextMenu = newVal;
                    this.plugin.saveSettings();
                    if (newVal) {
                        this.plugin.app.workspace.on('file-menu', this.plugin.addFileMenuItems);
                    } else {
                        this.plugin.app.workspace.off('file-menu', this.plugin.addFileMenuItems);
                    }
                });
            });
    }
}