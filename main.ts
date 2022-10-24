/* eslint-disable no-mixed-spaces-and-tabs */
import { Editor, MarkdownView, Menu, Plugin, TFile, addIcon } from 'obsidian';
import { UrlExpanderSettingsTab, UrlExpanderPluginSettings, DEFAULT_SETTINGS } from './settings';
import { ConfirmationModal } from 'modals';
import * as Expander from 'expander';
import * as Icons from './icons';

export default class UrlExpanderPlugin extends Plugin {
	settings: UrlExpanderPluginSettings;

	async onload() {
		console.log('URL Expander Loading...');

		// Icons for use in the context menu
        addIcon('expandIcon', Icons.EXPAND_ICON);
        addIcon('conversionIcon', Icons.CONVERSION_ICON);
		addIcon('vaultIcon', Icons.VAULT_ICON);

		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new UrlExpanderSettingsTab(this.app, this));

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'expand-selected-link-to-md',
			name: 'Expand Selected Link to Markdown',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				Expander.expandSelectedLink(this);
			}
		});

        this.addCommand({
            id: 'expand-all-links-in-active-file-to-md',
            name: 'Active File: Expand Links to Markdown',
            callback: () => {
                Expander.expandLinksInActiveFile(this);
            },
        });

        this.addCommand({
            id: 'expand-all-links-in-vault-to-md',
            name: 'Vault: Expand Links to Markdown',
            callback: () => {
                const infoText = 'Are you sure you want to convert all Web Links to Markdown Links?';
                const modal = new ConfirmationModal(this.app, infoText, () => Expander.expandLinksInVault(this));
                modal.open();
            },
        });

		if (this.settings.contextMenu) this.app.workspace.on('file-menu', this.addFileMenuItems);
	}

	onunload() {
		console.log('URL Expander Unloading...');
		this.app.workspace.off('file-menu', this.addFileMenuItems);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	addFileMenuItems = (menu: Menu, file: TFile) => {
        if (!(file instanceof TFile && file.extension === 'md')) return;

        menu.addSeparator();

        menu.addItem((item) => {
            item.setTitle('Expand Selected Link to Markdown')
                .setIcon('expandIcon')
                .onClick(() => Expander.expandSelectedLink(this));
        });

        menu.addItem((item) => {
            item.setTitle('Expand All Links in Active Note to Markdown')
                .setIcon('conversionIcon')
                .onClick(() => Expander.expandLinksInActiveFile(this));
        });

		menu.addItem((item) => {
            item.setTitle('Expand All Links in Vault to Markdown')
                .setIcon('vaultIcon')
                .onClick(() => Expander.expandLinksInVault(this));
        });

        menu.addSeparator();
    };
}
