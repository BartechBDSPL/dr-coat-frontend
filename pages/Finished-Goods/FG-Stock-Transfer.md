# FG Stock Transfer Module Process

This document outlines the steps involved in **accessing the FG Stock Transfer module**, **selecting transfer orders**, **viewing transfer details**, **scanning materials**, **executing pick operations**, **viewing picked data**, and **performing reverse operations** using the FG Stock Transfer Module.

---

## 1. Open FG Stock Transfer Module

Access the Stock Transfer screen from the application menu.

- **Step 1.1:** Navigate to **FG Stock Transfer** from the application menu.

- **Step 1.2:** The **Stock Transfer** screen will be displayed with transfer order selection and material scanning options.

  <img src="/IMAGE/FGStockTransfer/image1.png" width="400" alt="image1">

---

## 2. Select Stock Transfer Number

Choose a stock transfer order from the available list.

- **Step 2.1:** Click on the **Stock Transfer No** dropdown field to view available transfer orders.

- **Step 2.2:** The system will display a list of all pending stock transfer numbers in the dropdown.

- **Step 2.3:** Review the available Stock Transfer Numbers and select the desired transfer order from the list.

  <img src="/IMAGE/FGStockTransfer/image2.png" width="400" alt="image2">

---

## 3. View Transfer Order Details

Retrieve and display complete details for the selected stock transfer order.

- **Step 3.1:** After selecting the Stock Transfer No from the dropdown, the system will automatically retrieve the transfer order details.

- **Step 3.2:** All relevant information regarding the transfer order will be displayed.

- **Step 3.3:** A table will display all item codes included in the selected stock transfer order with their quantities and other relevant information.

- **Step 3.4:** Review the transfer order details to identify the items that need to be picked.

  <img src="/IMAGE/FGStockTransfer/image3.png" width="400" alt="image3">

---

## 4. Select Item Code for Picking

Choose a specific item from the transfer order for material picking.

- **Step 4.1:** Locate the desired item in the transfer order details table.

- **Step 4.2:** **Double-click** on the item code row to select it for the picking operation.

- **Step 4.3:** The system will retrieve and display detailed information for the selected item code.

- **Step 4.4:** Display Item Details.

- **Step 4.5:** The material barcode scan field will be enabled and ready for scanning.

  <img src="/IMAGE/FGStockTransfer/image4.png" width="400" alt="image4">

---

## 5. Scan Material Barcode

Scan the material barcode to verify and pick the item for stock transfer.

- **Step 5.1:** Focus on the **Material Barcode** scan field after selecting the item code.

- **Step 5.2:** Scan the material barcode using the scanner device.

- **Step 5.3:** The system will validate the scanned barcode against the selected item code.

### 5.1 Invalid Barcode Scenario

- **Step 5.3.1:** If the scanned barcode is invalid, does not match the selected item, or is not found in the system, an error message will be displayed.

- **Step 5.3.2:** The user must scan a valid material barcode that matches the selected item code to proceed with the picking operation.

  <img src="/IMAGE/FGStockTransfer/image5.png" width="400" alt="image5">

### 5.2 Valid Barcode Scenario

- **Step 5.3.3:** If the scanned barcode is valid and matches the selected item, the system will retrieve and display the complete item details. **Then Scanned item will be picked automatically and will be displayed in the list below.**

- **Step 5.3.4:** A success message will be displayed: **"Picking Done Successfully"**.

- **Step 5.3.5:** The picked item will be marked as completed in the transfer order details table.

- **Step 5.3.6:** After successfully picking materials, the picked data will be automatically displayed in the table below the picking section.

  <img src="/IMAGE/FGStockTransfer/image8.png" width="400" alt="image8">

---

## 6. Reversal of Picked Material 

Activate the reverse function to undo picking operations.

- **Step 6.1:** If a material was picked incorrectly or needs to be reversed, locate the **Reverse** checkbox on the screen.

- **Step 6.2:** Click on the **Reverse** checkbox to enable reverse picking mode.

- **Step 6.3:** The system will activate the reverse functionality and prepare for reverse picking operations.

- **Step 6.4:** The material barcode scan field will be enabled for scanning the picked material that needs to be reversed.

  <img src="/IMAGE/FGStockTransfer/image9.png" width="400" alt="image9">


Scan the previously picked material to retrieve its details for reversal.


- **Step 6.5:** Scan the barcode of the material that was previously picked and needs to be reversed.

- **Step 6.6:** The system will validate the scanned barcode and verify that it was previously picked.

- **Step 6.7:** All details of the picked material will be displayed.

- **Step 6.8:** The picked material details will be populated on the screen, ready for the reverse operation.

- **Step 6.9:** After confirming all details are correct, click the **Reversed** button.

- **Step 6.10:** The system will process the reverse operation and undo the previous pick transaction.

- **Step 6.11:** The material quantity will be returned to the selected location and the inventory will be updated accordingly.

- **Step 6.12:** The picking record will be marked as reversed in the system.

- **Step 6.13:** A success message will be displayed confirming the successful reversal operation.

- **Step 6.14:** The reversed material will be removed from the picked materials table and it will be return back to its previous location.

- **Step 6.15:** The stock transfer order status will be updated to reflect the reversal.

  <img src="/IMAGE/FGStockTransfer/image10.png" width="400" alt="image10">


---

## 7. Picking Suggestions


- **Step 7.1:** click on the **Location Symbol** button to view picking suggestions.

- **Step 7.2:** The system will display the **Picking Suggestion** screen with a list of available storage locations.

- **Step 7.3:** The picking suggestion may include the original location from where the material was picked or other sui.


table locations.

- **Step 7.4:** Review the list of suggested locations and select the appropriate location.


  <img src="/IMAGE/FGStockTransfer/image11.png" width="400" alt="image11">


