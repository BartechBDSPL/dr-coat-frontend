# Material Split Module Process

This document outlines the steps involved in **accessing the Material Split module**, **scanning material barcodes**, **entering split quantities**, **validating split operations**, and **printing split labels** using the Material Split Module.

---

## 1. Open Material Split Module

Access the Material Split screen from the application menu.

- **Step 1.1:** Navigate to **Material Split** from the application menu.

- **Step 1.2:** The **Material Split** screen will be displayed with material scanning and split quantity input options.
  ![image1](/IMAGE/MaterialSplit/image1.png)

---

## 2. Scan Material Barcode

Scan the material barcode to retrieve material details for the split operation.

- **Step 2.1:** Focus on the **Material Barcode** scan field on the Material Split screen.

- **Step 2.2:** Scan the material barcode using the scanner device.

- **Step 2.3:** The system will validate the scanned barcode.

### 2.1 Invalid Barcode Scenario

- **Step 2.3.1:** If the scanned barcode is invalid or not found in the system, an error message will be displayed: **"Invalid barcode scanned"**.

- **Step 2.3.2:** The user must scan a valid material barcode to proceed with the split operation.

  ![image2](/IMAGE/MaterialSplit/image2.png)

### 2.2 Valid Barcode Scenario

- **Step 2.3.3:** If the scanned barcode is valid, the system will retrieve and display all material details.

- **Step 2.3.4:** Material details will be displayed on the screen.

  ![image3](/IMAGE/MaterialSplit/image3.png)
 
---

## 3. Enter Split Quantity and Tare Weights

Input the split quantity and tare weight information for the material split operation.

- **Step 3.1:** After the material details are displayed, enter the **Split Quantity** in the designated field.

- **Step 3.2:** The Split Quantity represents the amount of material to be separated from the original batch.

- **Step 3.3:** Enter the **Tare Weight-1** value in the corresponding field for the first split container.

- **Step 3.4:** Enter the **Tare Weight-2** value in the corresponding field for the second split container.

- **Step 3.5:** Verify that all entered values are accurate before proceeding with the split operation.
 ![image4](/IMAGE/MaterialSplit/image4.png)



---

## 4. Validate Split Quantity

Ensure the split quantity does not exceed the available material quantity.

- **Step 4.1:** The system will automatically validate the entered Split Quantity against the Available Quantity.

- **Step 4.2:** If the Split Quantity exceeds the Available Quantity, an error message will be displayed: **"Split quantity exceed"**.

- **Step 4.3:** The user must enter a valid Split Quantity that is less than or equal to the Available Quantity.

- **Step 4.4:** Adjust the Split Quantity if necessary and re-validate before proceeding.

  ![image5](/IMAGE/MaterialSplit/image5.png)
  

---

## 5. Print Split Label

Generate and print labels for the split material after successful validation.

- **Step 5.1:** After entering the correct Split Quantity, Tare Weight-1, and Tare Weight-2, verify all details are accurate.

- **Step 5.2:** Ensure the Split Quantity does not exceed the Available Quantity.

- **Step 5.3:** Click the **Print Label** button to initiate the label printing process.

- **Step 5.4:** The system will process the split operation and generate labels for both the split material portions.

- **Step 5.5:** The label printer will print the labels containing material information, split quantities, batch details, and barcode information.

- **Step 5.6:** A success message will be displayed and put away will be executed automatically.

- **Step 5.7:** The split operation is now complete, and the inventory records will be updated accordingly.

 ![image6](/IMAGE/MaterialSplit/image6.png)

---

## Summary

- **Open Material Split Module:** Click on Material Split menu to display the Material Split screen.
- **Scan Material:** Scan material barcode to retrieve details. System displays "Invalid barcode scanned" for invalid barcodes or shows complete material information for valid barcodes.
- **Enter Split Details:** Enter Split Quantity, Tare Weight-1, and Tare Weight-2 values after material details are displayed.
- **Validate Quantity:** System validates the Split Quantity. If it exceeds the available quantity, displays "Split quantity exceed" error message.
- **Print Label:** If all quantities are correct, click Print Label button to print labels and display success message confirming the split operation.

---