import UrlExpanderPlugin from 'main';
import { App, FuzzySuggestModal, Modal, TFolder } from 'obsidian';
import * as Expander from './expander';

export class ConfirmationModal extends Modal {
    callback: Function;
    message: string;

    constructor(app: App, message: string, callback: Function) {
        super(app);
        this.message = message;
        this.callback = callback;
    }

    onOpen() {
        const { contentEl } = this;

        const mainDiv = contentEl.createEl('div');
        mainDiv.addClass('oz-modal-center');
        mainDiv.innerHTML = `
            <div class="oz-modal-title">
                <h2>URL Expander Plugin</h2>
            </div>
            <p>${this.message}</p>
        `;

        const continueButton = contentEl.createEl('button', { text: 'Continue' });
        continueButton.addEventListener('click', () => {
            this.callback();
            this.close();
        });

        const cancelButton = contentEl.createEl('button', { text: 'Cancel' });
        cancelButton.style.cssText = 'float: right;';
        cancelButton.addEventListener('click', () => this.close());
    }
}

export class FolderSuggestionModal extends FuzzySuggestModal<TFolder> {
    app: App;
    plugin: UrlExpanderPlugin;

    constructor(plugin: UrlExpanderPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    getItemText(item: TFolder): string {
        return item.path;
    }

    getItems(): TFolder[] {
        return getAllFoldersInVault(this.app);
    }

    onChooseItem(folder: TFolder, evt: MouseEvent | KeyboardEvent) {
        const infoText = `Are you sure you want to convert all Web Links to Markdown Link under ${folder.name}?`;
        const modal = new ConfirmationModal(this.app, infoText, () => Expander.expandLinksUnderFolder(folder, this.plugin));
        modal.open();
    }
}

function getAllFoldersInVault(app: App): TFolder[] {
    const folders: TFolder[] = [];
    const rootFolder = app.vault.getRoot();
    folders.push(rootFolder);
    function recursiveFx(folder: TFolder) {
        for (let child of folder.children) {
            if (child instanceof TFolder) {
                let childFolder: TFolder = child as TFolder;
                folders.push(childFolder);
                if (childFolder.children) recursiveFx(childFolder);
            }
        }
    }
    recursiveFx(rootFolder);
    return folders;
}