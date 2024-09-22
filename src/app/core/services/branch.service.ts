import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';

import { SaveFile } from '@/core/type';

@Injectable()
export class BranchService {
  // Converts FileList to File[]
  getListOfFiles(fileList: FileList): Observable<SaveFile[]> {
    const observableList: Observable<SaveFile>[] = [];
    const sizeLimitFileList: string[] = [];
    for (const bitFile of Array.from(fileList)) {
      const path: string = bitFile['webkitRelativePath'] || '';
      if (bitFile.size > 200000000) {
        sizeLimitFileList.push(path || bitFile.name);
        continue;
      }
      observableList.push(new Observable(observer => {
        const newFile = new SaveFile();
        newFile.name = bitFile.name;
        newFile.size = bitFile.size;
        const reader = new FileReader();
        reader.readAsArrayBuffer(bitFile);
        reader.onload = () => {
          newFile.binary = new Uint8Array(reader.result as ArrayBuffer);
          observer.next(newFile);
        };
      }));
    }
    this.displaySizeLimitFiles(sizeLimitFileList, '200Mb');
    if (observableList.length > 0) {
      return zip(...observableList);
    } else {
      return new Observable(observer => observer.next([]));
    }
  }

  // Shows which files weren't uploaded, because of the size
  private displaySizeLimitFiles(sizeLimitFileList: string[], size: string): void {
    if (sizeLimitFileList.length > 0) {
      let SIZE_LIMIT_MESSAGE: string = `Size of a file can't be more than ${size}.\n`;
      SIZE_LIMIT_MESSAGE += "Files below weren't uploaded because of the limit:\n\n";

      const sizeLimitMessage: string = SIZE_LIMIT_MESSAGE + sizeLimitFileList.join('\n');
      console.log(sizeLimitMessage);
    }
  }
}
