# Put Away HHT Module Process

This document outlines the steps involved in **accessing the Put Away module**, **selecting warehouse and location**, **scanning material barcodes**, and **executing put away operations** using the Put Away HHT Module.

---

## 1. Open Put Away HHT Module

Access the Put Away screen from the HHT application.

- **Step 1.1:** Navigate to **Put Away** from the HHT menu.

- **Step 1.2:** The **Put Away** screen will be displayed with warehouse selection and material scanning options.

  <img src="/IMAGE/PutAway/image1.png" width="400" alt="image1">

---

## 2. Select Warehouse Code

Choose the warehouse where the put away operation will be performed.

- **Step 2.1:** The **Warehouse Code** dropdown will be displayed on the Put Away screen.

- **Step 2.2:** Select the appropriate **Warehouse Code** from the dropdown list.

- **Step 2.3:** The warehouse selection is required to proceed with location selection.

  <img src="/IMAGE/PutAway/image2.png" width="400" alt="image2">

---

## 3. Select Storage Location

Choose the target location for putting away materials.

- **Step 3.1:** Click on the **Location Symbol** button to open the location selection screen.

- **Step 3.2:** The system will display all available storage locations for the selected warehouse.

- **Step 3.3:** Review the list of locations and **double-click** on the desired location to select it.

- **Step 3.4:** The selected location will be populated in the Location field on the Put Away screen.

  <img src="/IMAGE/PutAway/image3.png" width="400" alt="image3">
  <img src="/IMAGE/PutAway/image4.png" width="400" alt="image4">
  <img src="/IMAGE/PutAway/image5.png" width="400" alt="image5">

---

## 4. Scan Material Barcode

Scan the material barcode to retrieve material details for put away.

- **Step 4.1:** After selecting the warehouse and location, focus on the **Material Barcode** scan field.

- **Step 4.2:** Scan the material barcode using the HHT scanner.

- **Step 4.3:** The system will validate the scanned barcode.

### 4.1 Invalid Barcode Scenario

- **Step 4.3.1:** If the scanned barcode is invalid or not found in the system, an error message will be displayed: **"Invalid barcode scanned"**.

- **Step 4.3.2:** The user must scan a valid material barcode to proceed.

  <img src="/IMAGE/PutAway/image6.png" width="400" alt="image6">

### 4.2 Valid Barcode Scenario

- **Step 4.3.3:** If the scanned barcode is valid, a confirmation message will be displayed: **"Valid barcode scanned"**.

- **Step 4.3.4:** The system will retrieve and display all material details including Material Code, Material Description, Quantity, Batch No, and other relevant information.

- **Step 4.3.5:** The scanned material details will be added to the materials table at the bottom of the screen.

  <img src="/IMAGE/PutAway/image7.png" width="400" alt="image7">

---

## 5. Execute Put Away Operation

Complete the put away process by confirming the material placement.

- **Step 5.1:** Review all scanned material details displayed in the table including Material Code, Quantity, Location, and other information.

- **Step 5.2:** Verify that all materials are correctly scanned and the location is accurate.

- **Step 5.3:** Click the **Put Away** button to execute the put away operation.

- **Step 5.4:** The system will process the put away transaction and update the inventory.

- **Step 5.5:** A confirmation message will appear upon successful completion of the put away operation.

- **Step 5.6:** The materials will be recorded as stored in the selected location.

    <img src="/IMAGE/PutAway/image10.png" width="400" alt="image10">

---

## 6. Remove Scanned Material (Optional)

Remove incorrectly scanned materials from the put away list before execution.

- **Step 6.1:** If a material was scanned incorrectly or needs to be removed from the put away list, locate the material in the materials table.

- **Step 6.2:** Select the material row that needs to be removed.

- **Step 6.3:** Click the **Remove** button to delete the selected material from the table.

- **Step 6.4:** The system will remove the scanned material entry from the put away list.

- **Step 6.5:** The removed material will no longer be included in the put away operation.

- **Step 6.6:** You can then scan the correct material barcode if needed.

  <img src="/IMAGE/PutAway/image9.png" width="400" alt="image10">

---

## Summary

- **Open Put Away Module:** Access the Put Away screen from HHT menu to begin the put away process.
- **Select Warehouse:** Choose the appropriate Warehouse Code from the dropdown list.
- **Select Location:** Click Location Symbol to display all locations, then double-click to select the desired storage location.
- **Scan Material:** Scan material barcode to retrieve details. System validates and displays "Invalid barcode scanned" for invalid barcodes or "Valid barcode scanned" with complete material details for valid barcodes.
- **Execute Put Away:** Review all scanned materials and click Put Away button to complete the operation.
- **Remove Material:** Select and remove any incorrectly scanned materials from the table using the Remove button before executing put away.

---