import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import generateInvoice from '@salesforce/apex/InvoiceController.generateInvoice';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";

export default class CreateInvoice extends NavigationMixin(LightningElement) {

    currentPageRef;
    rowData = [];

    columns = [
        { label: 'URL Parameter', fieldName: 'urlParam', type: 'text' },
        { label: 'Value', fieldName: 'urlParamValue', type: 'text' }
    ];

    paramValuesMap = {};
    paramValuesMapRaw = {};

    invoiceJsonString = '';

    // Approach 1 : Using pageReference object (but needs keys to be prepended with c__ / namespace__)
    @wire(CurrentPageReference)
    setRowDataBasedOnPageRef(currentPageReference) {
        this.currentPageRef = currentPageReference;
        if (this.currentPageRef?.state) {
            // Arbitrary counter for row's unique Id 
            let idNum = 0;
            this.paramValuesMapRaw = Object.entries(this.currentPageRef.state);
            for (let [key, value] of this.paramValuesMapRaw) {
                this.rowData.push(
                    {
                        id: idNum++,
                        urlParam: key,
                        urlParamValue: value
                    }
                )

                // removing c__. Can be modified to accomodate any namespace if needed
                this.paramValuesMap[key.substring(3)] = value;
            }
        }
    }
    // Approach 1 : Using pageReference object (but needs keys to be prepended with c__ / namespace__)

    showJSONdata() {
        generateInvoice({
            urlParamValuesMap: this.paramValuesMap,
            doInsert: false
        }).then(result => {
            this.showToast("Success", "Generated Invoice JSON", "Success");
            this.invoiceJsonString = result;
        }
        ).catch(err => {
            this.showToast("Error", err, "Error");
        }).finally(() => {

        })
    }

    createInvoice() {
        generateInvoice({
            urlParamValuesMap: this.paramValuesMap,
            doInsert: true
        }).then(result => {
            this.showToast("Success", "Generated Invoice in Salesforce. Redirecting...", "Success");
            console.log(result);
            this.navigateToRecordViewPage(result);
        }
        ).catch(err => {
            this.showToast("Error", err, "Error");
        }).finally(() => {

        })
    }

    navigateToRecordViewPage(recordId) {
        // View a Invoice record.
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: recordId,
                actionName: "view",
            },
        });
    }


    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

    get showTablePage() {
        return !this.invoiceJsonString;
    }

    get showJSONPage() {
        return !!this.invoiceJsonString;
    }

    // // Approach 2 : Using plain javascript (to overcome namespace__)
    // connectedCallback(){
    //     this.setRowDataBasedOnParams();
    // }

    // setRowDataBasedOnParams(){
    //     const queryString = window.location.search;
    //     const urlParams = new URLSearchParams(queryString);
    //     let idNum = 0;
    //     for(let [key, value] of urlParams.entries()){
    //         this.rowData.push(
    //             {
    //                 id : idNum++,
    //                 urlParam: key,
    //                 urlParamValue: value
    //             }
    //         )
    //     }
    // }
    // // Approach 2 : Using plain javascript

}