import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocationStateService {

    execChange: Subject<any> = new Subject<any>();

    constructor() {}

    change(data: any) {
        this.execChange.next(data);
    }
}