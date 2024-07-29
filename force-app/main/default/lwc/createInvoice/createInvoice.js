import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class CreateInvoice extends LightningElement {

    currentPageRef;
    rowData = [];

    columns = [
        { label: 'URL Parameter', fieldName: 'urlParam', type: 'text' },
        { label: 'Value', fieldName: 'urlParamValue', type: 'text' }
    ];

    // Approach 1 : Using pageReference object (but needs keys to be prepended with c__ / namespace__)
    @wire(CurrentPageReference)
    setRowDataBasedOnPageRef(currentPageReference) {
        this.currentPageRef = currentPageReference;
        if(this.currentPageRef?.state){
            // Arbitrary counter for row's unique Id 
            let idNum = 0;
            for(let [key, value] of Object.entries(this.currentPageRef.state)){
                this.rowData.push(
                    {
                        id : idNum++,
                        urlParam: key,
                        urlParamValue: value
                    }
                )
            }
        }
    }
    // Approach 1 : Using pageReference object (but needs keys to be prepended with c__ / namespace__)


    // Approach 2 : Using plain javascript (to overcome namespace__)
    connectedCallback(){
        this.setRowDataBasedOnParams();
    }

    setRowDataBasedOnParams(){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let idNum = 0;
        for(let [key, value] of urlParams.entries()){
            this.rowData.push(
                {
                    id : idNum++,
                    urlParam: key,
                    urlParamValue: value
                }
            )
        }
    }
    // Approach 2 : Using plain javascript

}