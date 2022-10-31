import UrlExpanderPlugin from './main';
import { App, TFile, Notice, TFolder, MarkdownView } from 'obsidian';
import { getTitle, getFilesUnderPath, validate } from './utils';

// Import the library to unshorten urls
import Deshortifier from 'deshortify'

/* -------------------- EXTERNAL LINK DETECTOR -------------------- */

// Regex to validate any url
const regex = /(https:|http:|www\.)\S*/gim;
const regexMDLinks = /\((https:|http:|www\.)\S+(\)\S{0,2})/gim;

/* -------------------- CONVERTERS -------------------- */

// --> Converts single file to provided final format and save back in the file
export const expandLinksAndSaveInSingleFile = async (mdFile: TFile, plugin: UrlExpanderPlugin) => {
    const fileText = await plugin.app.vault.read(mdFile);
    const newFileText = await ExpandUrlToMarkdown(fileText, mdFile, plugin);
    if (newFileText !== fileText) {
        await plugin.app.vault.modify(mdFile, newFileText);
    }
};

// --> Command Function: Converts All Links and Saves in Current Active File
export const expandLinksInActiveFile = async (plugin: UrlExpanderPlugin) => {
    const mdFile: TFile|null = plugin.app.workspace.getActiveFile();
    if (mdFile !== null && mdFile.extension === 'md') {
        await expandLinksAndSaveInSingleFile(mdFile, plugin);
    } else {
        new Notice('Active File is not a Markdown File');
    }
};

// --> Convert Links under Files under a Certain Folder
export const expandLinksUnderFolder = async (folder: TFolder, plugin: UrlExpanderPlugin) => {
    const mdFiles: TFile[] = getFilesUnderPath(folder.path, plugin);
    const notice = new Notice('Starting link expansion', 0);
    try {
        const totalCount = mdFiles.length;
        let counter = 0;
        for (const mdFile of mdFiles) {
            counter++;
            notice.setMessage(`Expanding the links in notes ${counter}/${totalCount}.`);
            // --> Skip Excalidraw and Kanban Files
            if (hasFrontmatter(plugin.app, mdFile.path, 'excalidraw-plugin') || hasFrontmatter(plugin.app, mdFile.path, 'kanban-plugin')) {
                continue;
            }
            await expandLinksAndSaveInSingleFile(mdFile, plugin);
        }
    } catch (err) {
        console.log(err);
    } finally {
        notice.hide();
    }
};

// --> Convert Links within editor Selection
export const expandSelectedLink = async (plugin: UrlExpanderPlugin) => {
    const activeLeaf = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeLeaf) {
        const editor = activeLeaf.editor;
        const selection = editor.getSelection();
        const sourceFile = activeLeaf.file;
        if (selection !== '') {
            const newText = await ExpandUrlToMarkdown(selection, sourceFile, plugin);
            editor.replaceSelection(newText);
        } else {
            new Notice("You didn't select any external link.");
        }
    } else {
        new Notice('There is no active leaf open.', 3000);
    }
};

// --> Command Function: Converts All Links in All Files in Vault and Save in Corresponding Files
export const expandLinksInVault = async (plugin: UrlExpanderPlugin) => {
    expandLinksUnderFolder(plugin.app.vault.getRoot(), plugin);
};

const hasFrontmatter = (app: App, filePath: string, keyToCheck: string) => {
    const metaCache = app.metadataCache.getCache(filePath);
    if (metaCache){
        return metaCache.frontmatter && metaCache.frontmatter[keyToCheck];
    }
    return false;
};

/* -------------------- LINKS TO MARKDOWN EXPANDER -------------------- */

// --> Converts links within given string to MD
export const ExpandUrlToMarkdown = async (md: string, sourceFile: TFile, plugin: UrlExpanderPlugin): Promise<string> => {
    let newMdText = md;
    // --> Get All Links
    const matches = md.match(regex);
    if (matches === null) return md;
    // Remove Links that are already in Markdown format
    const remainingMatches = [];
    for (const match of matches) {
        if (!(regexMDLinks.test(match))) {
            remainingMatches.push(match);
        }
    }
    console.log(remainingMatches);
    const deshortifier = new Deshortifier({ verbose: true });
    if (remainingMatches) {
        for (const match of remainingMatches) {
            let longUrl = match;
            let title = '';
            // Check that the match is indeed an external link
            if (validate(match)) {
                longUrl = await deshortifier.deshortify(match);
                const pos = longUrl.lastIndexOf('http');
                if (pos > 0) {
                    longUrl = decodeURIComponent(longUrl.substring(pos))
                }
                title = await getTitle(longUrl);
            }
            if (title === ''){
                title = longUrl;
            }
            const mdLink = `[${title}](${decodeURI(longUrl)})`;
            newMdText = newMdText.replace(match, mdLink);
        }
    }
    return newMdText;
};
