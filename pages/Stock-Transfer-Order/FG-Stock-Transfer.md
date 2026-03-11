# FG Stock Transfer Module Process

This document outlines the steps involved in **accessing the FG Stock Transfer module**, **selecting transfer orders**, **viewing transfer details**, **scanning materials**, **executing pick operations**, **viewing picked data**, and **performing reverse operations** using the FG Stock Transfer Module.

---

## 1. Open FG Stock Transfer Module

Access the Stock Transfer screen from the application menu.

- **Step 1.1:** Navigate to **FG Stock Transfer** from the application menu.

- **Step 1.2:** The **Stock Transfer** screen will be displayed with transfer order selection and material scanning options.

  ![image1](/IMAGE/FGStockTransfer/image1.png)

---

## 2. Select Stock Transfer Number

Choose a stock transfer order from the available list.

- **Step 2.1:** Click on the **Stock Transfer No** dropdown field to view available transfer orders.

- **Step 2.2:** The system will display a list of all pending stock transfer numbers in the dropdown.

- **Step 2.3:** Review the available Stock Transfer Numbers and select the desired transfer order from the list.

  ![image2](/IMAGE/FGStockTransfer/image2.png)

---

## 3. View Transfer Order Details

Retrieve and display complete details for the selected stock transfer order.

- **Step 3.1:** After selecting the Stock Transfer No from the dropdown, the system will automatically retrieve the transfer order details.

- **Step 3.2:** All relevant information regarding the transfer order will be displayed.

- **Step 3.3:** A table will display all item codes included in the selected stock transfer order with their quantities and other relevant information.

- **Step 3.4:** Review the transfer order details to identify the items that need to be picked.

  ![image3](/IMAGE/FGStockTransfer/image3.png)

---

## 4. Select Item Code for Picking

Choose a specific item from the transfer order for material picking.

- **Step 4.1:** Locate the desired item in the transfer order details table.

- **Step 4.2:** **Double-click** on the item code row to select it for the picking operation.

- **Step 4.3:** The system will retrieve and display detailed information for the selected item code.

- **Step 4.4:** Display Item Details.

- **Step 4.5:** The material barcode scan field will be enabled and ready for scanning.

  ![image4](/IMAGE/FGStockTransfer/image4.png)

---

## 5. Scan Material Barcode

Scan the material barcode to verify and pick the item for stock transfer.

- **Step 5.1:** Focus on the **Material Barcode** scan field after selecting the item code.

- **Step 5.2:** Scan the material barcode using the scanner device.

- **Step 5.3:** The system will validate the scanned barcode against the selected item code.

### 5.1 Invalid Barcode Scenario

- **Step 5.3.1:** If the scanned barcode is invalid, does not match the selected item, or is not found in the system, an error message will be displayed: **"Invalid barcode scanned"**.

- **Step 5.3.2:** The user must scan a valid material barcode that matches the selected item code to proceed with the picking operation.

  ![image5](/IMAGE/FGStockTransfer/image5.png)

### 5.2 Valid Barcode Scenario

- **Step 5.3.3:** If the scanned barcode is valid and matches the selected item, the system will retrieve and display the complete item details.

- **Step 5.3.4:** Material information will be confirmed on the screen.

- **Step 5.3.5:** The scanned material will be validated and ready for the picking operation.

  ![image6](/IMAGE/FGStockTransfer/image6.png)

---

## 6. Execute Pick Material Operation

Complete the picking process for the scanned material.

- **Step 6.1:** After scanning the valid material barcode and confirming all item details are correct, click the **Pick Material** button.

- **Step 6.2:** The system will process the pick operation and update the transfer order status.

- **Step 6.3:** The picked material quantity will be recorded against the stock transfer order.

- **Step 6.4:** The inventory location will be updated to reflect the material pick.

- **Step 6.5:** A success message will be displayed: **"Picking Done Successfully"**.

- **Step 6.6:** The picked item will be marked as completed in the transfer order details table.

- **Step 6.7:** After successfully picking materials, the picked data will be automatically displayed in the table below the picking section.

  ![image8](/IMAGE/FGStockTransfer/image8.png)

---

## 7. Enable Reverse Picking Mode

Activate the reverse function to undo picking operations.

- **Step 7.1:** If a material was picked incorrectly or needs to be reversed, locate the **Reverse** checkbox on the screen.

- **Step 7.2:** Click on the **Reverse** checkbox to enable reverse picking mode.

- **Step 7.3:** The system will activate the reverse functionality and prepare for reverse picking operations.

- **Step 7.4:** The material barcode scan field will be enabled for scanning the picked material that needs to be reversed.

  ![image9](/IMAGE/FGStockTransfer/image9.png)

---

## 8. Select Location for Reversal

Choose the location where the material will be returned during the reverse operation.

- **Step 8.1:** After enabling the Reverse checkbox, click on the **Location Symbol** button to view picking suggestions and available locations.

- **Step 8.2:** The system will display the **Picking Suggestion** screen with a list of available storage locations.

- **Step 8.3:** The picking suggestion may include the original location from where the material was picked or other suitable locations.

- **Step 8.4:** Review the list of suggested locations and select the appropriate location where the material should be returned.

- **Step 8.5:** The selected location will be populated in the Location field on the reverse picking screen.

  ![image11](/IMAGE/FGStockTransfer/image11.png)

---

## 9. Scan Picked Material for Reversal

Scan the previously picked material to retrieve its details for reversal.

- **Step 9.1:** After selecting the return location, focus on the material barcode scan field.

- **Step 9.2:** Scan the barcode of the material that was previously picked and needs to be reversed.

- **Step 9.3:** The system will validate the scanned barcode and verify that it was previously picked.

- **Step 9.4:** All details of the picked material will be displayed.

- **Step 9.5:** The picked material details will be populated on the screen, ready for the reverse operation.

- **Step 9.6:** After confirming all details are correct, click the **Reversed** button.

- **Step 9.7:** The system will process the reverse operation and undo the previous pick transaction.

- **Step 9.8:** The material quantity will be returned to the selected location and the inventory will be updated accordingly.

- **Step 9.9:** The picking record will be marked as reversed in the system.

- **Step 9.10:** A success message will be displayed confirming the successful reversal operation.

- **Step 9.11:** The reversed material will be removed from the picked materials table or marked as reversed.

- **Step 9.12:** The stock transfer order status will be updated to reflect the reversal.

  ![image10](/IMAGE/FGStockTransfer/image10.png)


---

## Summary

- **Open Stock Transfer Module:** Click on FG Stock Transfer menu to display the Stock Transfer screen.
- **Select Transfer Order:** Click on Stock Transfer No dropdown to display all available transfer numbers and select the desired order.
- **View Transfer Details:** After selecting Stock Transfer No, system displays all details regarding the transfer order with items listed in a table.
- **Select Item:** Double-click on the item code in the table to display item details and enable material barcode scanning.
- **Scan Material:** Scan material barcode to verify the item. System displays "Invalid barcode scanned" for invalid or mismatched barcodes, or shows complete item details for valid barcodes.
- **Pick Material:** Click Pick Material button after scanning valid barcode to complete the picking operation and display "Picking Done Successfully" message. Picked materials are automatically displayed in the table below.
- **Enable Reverse Mode:** Click on the Reverse checkbox to activate revers