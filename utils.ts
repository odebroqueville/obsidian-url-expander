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
    const filesUnderPath: TFile[] = [];
    recursiveFx(path, plugin.app);
    function recursiveFx(path: string, app: App) {
        const folderObj = app.vault.getAbstractFileByPath(path);
        if (folderObj instanceof TFolder && folderObj.children) {
            for (const child of folderObj.children) {
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
        const api = 'https://good-tan-starfish-kit.cyclic.app/?url=';
        const request = new Request(api+url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        const response = await fetch(request);
        const title = await response.text();
        return title;
    } catch (err) {
        console.error(`Failed to retrieve title with error: ${err}`);
        return '';
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