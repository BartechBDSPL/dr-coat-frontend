# Shipment Dispatch Module Process

This document outlines the steps involved in **accessing the Shipment Dispatch module**, **selecting shipment orders**, **viewing item details**, **scanning materials**, **executing pick operations**, and **performing reverse operations** using the Shipment Dispatch Module.

---

## 1. Open Shipment Dispatch Module

Access the Shipment Dispatch screen from the application menu.

- **Step 1.1:** Navigate to **Shipment Dispatch** from the application menu.

- **Step 1.2:** The **Shipment Dispatch** screen will be displayed with shipment order selection and material picking options.

  <img src="/IMAGE/FGShipment/image1.png" width="400" alt="image1">

---

## 2. Select Shipment Order Number

Choose a shipment order for processing dispatch operations.

- **Step 2.1:** Locate the **Shipment Order No** dropdown field on the Shipment Dispatch screen.

- **Step 2.2:** Click on the **Shipment Order No** dropdown to view all available shipment orders.

- **Step 2.3:** The system will display a list of all pending shipment orders that are ready for dispatch.

- **Step 2.4:** Select the desired Shipment Order No from the dropdown list.

  <img src="/IMAGE/FGShipment/image1.png" width="400" alt="image1">


---

## 3. View Item Details

Retrieve and display complete item details for the selected shipment order.

- **Step 3.1:** After selecting the Shipment Order No, the system will automatically retrieve the shipment order details.

- **Step 3.2:** All item details will be displayed in the table.

- **Step 3.3:** Review the item details to identify the materials that need to be picked for dispatch.

  <img src="/IMAGE/FGShipment/image2.png" width="400" alt="image2">


---

## 4. Select Item for Picking

Choose a specific item from the shipment order for material picking.

- **Step 4.1:** Locate the desired item in the item details table.

- **Step 4.2:** **Double-click** on the item detail row to select it for the picking operation.

- **Step 4.3:** The system will retrieve and display detailed information for the selected item.

- **Step 4.4:** Item details will be displayed.

- **Step 4.5:** The material barcode scan field and picking options will be enabled.

  <img src="/IMAGE/FGShipment/image3.png" width="400" alt="image3">


---

## 5. View Picking Suggestions

Access picking suggestions to identify optimal material Suggestions.

- **Step 5.1:** After selecting the item by double-clicking, locate the **Picking Symbol** button on the screen.

- **Step 5.2:** Click on the **Picking Symbol** button to view picking suggestions.

- **Step 5.3:** The system will display the **Picking Suggestions** screen with a list of available material Suggestions.


- **Step 5.5:** Review the picking suggestions and click on the desired picking suggestion to select it.

- **Step 5.6:** The selected location will be populated in the picking screen for material scanning.

  <img src="/IMAGE/FGShipment/image4.png" width="400" alt="image4">
  <img src="/IMAGE/FGShipment/image5.png" width="400" alt="image5">

---

## 6. Scan Material Barcode

Scan the material barcode to verify and pick the item for shipment dispatch.

- **Step 6.1:** After selecting the picking suggestion, focus on the **Material Barcode** scan field.

- **Step 6.2:** Scan the material barcode using the scanner device.

- **Step 6.3:** The system will validate the scanned barcode against the selected item.

### 6.1 Invalid Barcode Scenario

- **Step 6.3.1:** If the scanned barcode is invalid, does not match the selected item, or is not found in the system, an error message will be displayed: **"Invalid barcode scanned"**.

- **Step 6.3.2:** The user must scan a valid material barcode that matches the selected item to proceed with the picking operation.

  <img src="/IMAGE/FGShipment/image6.png" width="400" alt="image6">

### 6.2 Valid Barcode Scenario

- **Step 6.3.3:** If the scanned barcode is valid and matches the selected item, the system will retrieve and display the complete material details.

- **Step 6.3.4:** Material information including Material Code, Material Description, Quantity, Batch No, Location, and other relevant details will be displayed below the scanning section.

- **Step 6.3.5:** The scanned material details will be shown in the table, ready for the picking operation.

  <img src="/IMAGE/FGShipment/image7.png" width="400" alt="image7">

---

## 7. Execute Pick Material Operation

Complete the picking process for the scanned material.

- **Step 7.1:** After scanning the valid material barcode and confirming all details are correct, locate the **Pick Material** button.

- **Step 7.2:** Click the **Pick Material** button to execute the picking operation.

- **Step 7.3:** The system will process the pick operation and update the shipment order status.

- **Step 7.4:** The picked material quantity will be recorded against the shipment order.

- **Step 7.5:** The inventory location will be updated to reflect the material pick.

- **Step 7.6:** A success message will be displayed confirming that the picking has been completed successfully.

- **Step 7.7:** The picked item will be marked as completed in the shipment order details.

  <img src="/IMAGE/FGShipment/image8.png" width="400" alt="image8">

---

## 8. Enable Reverse Picking Mode

Activate the reverse function to undo picking operations.

- **Step 8.1:** If a material was picked incorrectly or needs to be reversed, locate the **Reverse** checkbox on the screen.

- **Step 8.2:** Click on the **Reverse** checkbox to enable reverse picking mode.

- **Step 8.3:** The system will activate the reverse functionality and prepare for reverse picking operations.

- **Step 8.4:** The material barcode scan field will be enabled for scanning the picked material that needs to be reversed.

  <img src="/IMAGE/FGShipment/image9.png" width="400" alt="image9">

---

## 9. Scan and Reverse Picked Material

Scan the previously picked material to reverse the picking operation.

- **Step 9.1:** After enabling the Reverse checkbox, focus on the material barcode scan field.

- **Step 9.2:** Scan the barcode of the material that was previously picked and needs to be reversed.

- **Step 9.3:** The system will validate the scanned barcode and verify that it was previously picked.

- **Step 9.4:** All details of the picked material will be displayed.

- **Step 9.5:** The picked material details will be populated on the screen, ready for the reverse operation.

- **Step 9.6:** Click the **Reverse** or **Undo Pick** button to complete the reverse operation.

- **Step 9.7:** The system will process the reverse operation and undo the previous pick transaction.

- **Step 9.8:** The material quantity will be returned to the original location and the inventory will be updated accordingly.

- **Step 9.9:** The picking record will be marked as reversed in the system.

- **Step 9.10:** A success message will be displayed confirming the successful reversal operation.

- **Step 9.11:** The reversed material will be removed from the picked materials list.

- **Step 9.12:** The shipment order status will be updated to reflect the reversal.

  <img src="/IMAGE/FGShipment/image10.png" width="400" alt="image10">

---

## Summary

- **Open Shipment Dispatch Module:** Click on Shipment Dispatch menu to display the Shipment Dispatch screen.
- **Select Shipment Order:** Click on Shipment Order No dropdown to display all available shipment orders and select the desired order.
- **View Item Details:** After selecting Shipment Order No, system displays all item details in the table below.
- **Select Item:** Double-click on the item detail row to display complete item information and enable picking options.
- **View Picking Suggestions:** Click on Picking Symbol to display Picking Suggestions screen, then click on the desired location suggestion to select it.
- **Scan Material:** Scan material barcode to verify the item. System displays "Invalid barcode scanned" for invalid or mismatched barcodes, or shows complete material details below for valid barcodes.
- **Pick Material:** Click Pick Material button after scanning valid barcode to complete the picking operation and display success message.
- **Enable Reverse Mode:** Click on the Reverse checkbox to activate reverse picking functionality.
- **Reverse Pick:** Scan the previously picked material barcode to display details, then complete the reverse operation to undo the pick and display success message.

---