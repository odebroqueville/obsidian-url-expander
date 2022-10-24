import UrlExpanderPlugin from 'main';
import { TFile, TFolder, App } from 'obsidian';

// Regex to validate any url
const regex = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	'((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	'(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	'(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator

// Helper Function To Get List of Files
export const getFilesUnderPath = (path: string, plugin: UrlExpanderPlugin): TFile[] => {
    let filesUnderPath: TFile[] = [];
    recursiveFx(path, plugin.app);
    function recursiveFx(path: string, app: App) {
        const folderObj = app.vault.getAbstractFileByPath(path);
        if (folderObj instanceof TFolder && folderObj.children) {
            for (let child of folderObj.children) {
                if (child instanceof TFile && child.extension === 'md') filesUnderPath.push(child);
                if (child instanceof TFolder) recursiveFx(child.path, app);
            }
        }
    }
    return filesUnderPath;
};

// Helper function to get the title of a web page
export async function getTitle(url:string){
    try {
        const response = await fetch(url);
        if (response.status === 200){
            const html = await response.text();
            if (html) {
                const title = html.match(/<title.*?>.*?<\/title>/gmi)[0];
                if (title){
                    let titleText = title.substring(title.indexOf(">")+1);
                    titleText = titleText.replace("</title>","");
                    return titleText;
                }
            }
        }
        return "";
    } catch (err) {
        console.error(`Failed to retrieve title with error: ${err}`);
        return "";
    }
}

// Helper function to validate an url
export function validate(url:string) {
    if (regex.test(url)) {
        return true;
    } else {
        return false;
    }
}