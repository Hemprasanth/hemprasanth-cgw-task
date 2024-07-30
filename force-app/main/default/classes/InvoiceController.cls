/**
 * @description       : 
 * @author            : Hemprasanth Karunakaran
 * @group             : 
 * @last modified on  : 07-30-2024
 * @last modified by  : Hemprasanth Karunakaran
**/
public with sharing class InvoiceController {
    
    @AuraEnabled
    public static String generateInvoice(Map<String, String> urlParamValuesMap){
        String response = '';
        try {
            // Passing each param. Can pass a map as well if we have more params, and loop over to get field api names
    
            
            // Test data
            // c__origin_record=0065j00000IeubnAAB&c__account=accountId&c__invoice_date=createddate&c__invoice_due_date=lastmodifieddate&C__child_relationship_name=OpportunityLineItems&c__line_item_description=Description&c__line_item_quantity=quantity&c__line_item_unit_price=unitprice
            
            // Trading snake_case instead of camelCase for easier find
            Id origin_record = (Id) urlParamValuesMap.get('origin_record');
            String account = urlParamValuesMap.get('account');
            String invoice_date = urlParamValuesMap.get('invoice_date');
            String invoice_due_date = urlParamValuesMap.get('invoice_due_date');
            String child_relationship_name = urlParamValuesMap.get('child_relationship_name');
            String line_item_description = urlParamValuesMap.get('line_item_description');
            String line_item_quantity = urlParamValuesMap.get('line_item_quantity');
            String line_item_unit_price = urlParamValuesMap.get('line_item_unit_price');

            // Get SObject Name from Id dynamically
            String sobjectAPIName = origin_record.getSobjectType().getDescribe().getName();

            // Assuming all inputs are valid (not empty and of correct type)
            // Can add some validations - null checks, and perhaps SObject and Field API validations to name a few
            String query = 'SELECT Id, '
                + account + ', '
                 + invoice_date + ', '
                 + invoice_due_date + ', '
                 + '(' + 'SELECT ' + line_item_description + ', '
                 + line_item_quantity + ', '
                 + line_item_unit_price + ' FROM ' + child_relationship_name + ')' +
                 + ' FROM ' + sobjectAPIName + ' WHERE Id = :origin_record';

            System.debug('Query: ' + query);

            // Assuming Id is valid. Hence 1 SObject will be returned. Else List<SObject> or null handling
            SObject record = Database.query(query);
            
            String jsonData = generateJSON(
                record, 
                invoice_date, 
                invoice_due_date, 
                child_relationship_name, 
                line_item_description, 
                line_item_quantity, 
                line_item_unit_price
            );

            response = jsonData;

        } catch (Exception e) {
            // Note : Can log exception before throwing to client
            throw new AuraHandledException(e.getMessage() + ' +++ ' +  e.getStackTraceString());
        }
        return response;
    }

    public static String generateJSON(SObject record, String invoiceDate, String invoiceDueDate, String childRelationshipName, String lineItemDescription, String lineItemQuantity, String lineItemUnitPrice) {

        JSONGenerator gen = JSON.createGenerator(true);
        
        gen.writeStartObject(); // Start of the Invoice JSON Object
        
        gen.writeStringField('Type', 'ACCREC');
        
        // Contact object
        gen.writeFieldName('Contact');
        gen.writeStartObject();
        gen.writeStringField('ContactID', 'eaa28f49-6028-4b6e-bb12-d8f6278073fc');
        gen.writeEndObject();
        
        // Dates - UNIX 
        // Hardcoding for now - can get UNIX timestamp from standard Date object with getTime() method
        gen.writeStringField('Date', '/Date(1518685950940+0000)/');
        gen.writeStringField('DueDate', '/Date(1518685950940+0000)/');

        // Dates - String
        gen.writeStringField('DateString', String.valueOf(record.get(invoiceDate)));
        gen.writeStringField('DueDateString', String.valueOf(record.get(invoiceDueDate)));
        
        gen.writeStringField('LineAmountTypes', 'Exclusive');
        
        // LineItems array
        gen.writeFieldName('LineItems');
        gen.writeStartArray();
        for(SObject lineItemRecord : record.getSObjects(childRelationshipName)){
            System.debug('***' + lineItemRecord);
            // LineItem object
            gen.writeStartObject();
            gen.writeStringField('Description', (String) lineItemRecord.get(lineItemDescription));
            gen.writeStringField('Quantity', String.valueOf(lineItemRecord.get(lineItemQuantity)));
            gen.writeStringField('UnitAmount', String.valueOf(lineItemRecord.get(lineItemUnitPrice)));
            gen.writeStringField('AccountCode', '200');
            gen.writeStringField('DiscountRate', '20');
            gen.writeEndObject();
        }

        gen.writeEndArray(); // End of LineItems array
        
        gen.writeEndObject(); // End of Invoice JSON Object
        
        return gen.getAsString();
    }
    
}