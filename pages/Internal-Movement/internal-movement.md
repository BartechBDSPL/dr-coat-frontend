# FG Internal Movement Module Process

This document outlines the steps involved in **accessing the FG Internal Movement module**, **scanning material barcodes**, **selecting target location**, and **executing internal transfer operations** using the FG Internal Movement Module.

---

## 1. Open FG Internal Movement Module

Access the Internal Movement screen from the application menu.

- **Step 1.1:** Navigate to **FG Internal Movement** from the application menu.

- **Step 1.2:** The **Internal Movement** screen will be displayed with material scanning and location selection options.

  ![image1](/IMAGE/IntrenalMovement/image1.png)

---

## 2. Scan Material Barcode

Scan the finished goods material barcode to retrieve material details for internal movement.

- **Step 2.1:** Focus on the **Material Barcode** scan field on the Internal Movement screen.

- **Step 2.2:** Scan the material barcode using the scanner device.

- **Step 2.3:** The system will validate the scanned barcode.

### 2.1 Invalid Barcode Scenario

- **Step 2.3.1:** If the scanned barcode is invalid or not found in the system, an error message will be displayed: **"Invalid barcode scanned"**.

- **Step 2.3.2:** The user must scan a valid material barcode to proceed with the internal movement.

  ![image2](/IMAGE/IntrenalMovement/image2.png)

### 2.2 Valid Barcode Scenario

- **Step 2.3.3:** If the scanned barcode is valid, the system will retrieve and display all material information.

- **Step 2.3.4:** Material details will be displayed.

- **Step 2.3.5:** The scanned material details will be added to the materials list table at the bottom of the screen.

  ![image3](/IMAGE/IntrenalMovement/image3.png)


---

## 3. Remove Scanned Material (Optional)

Remove incorrectly scanned materials from the internal movement list before execution.

- **Step 3.1:** If a material was scanned incorrectly or needs to be removed from the internal movement list, locate the material in the materials table.

- **Step 3.2:** Select the material row that needs to be removed by clicking on it.

- **Step 3.3:** Click the **Remove** button to delete the selected material from the list.

- **Step 3.4:** Scan the material barcode that was previously scanned (the valid material you want to remove).

- **Step 3.5:** The system will remove the scanned material entry from the internal movement list.

- **Step 3.6:** The removed material will no longer be included in the internal movement operation.

  ![image4](/IMAGE/IntrenalMovement/image4.png)


---

## 4. Select Target Location

Choose the destination location for the internal movement of materials.

- **Step 4.1:** Click on the **Location Symbol** button to open the location selection screen.

- **Step 4.2:** The system will display a list of all available storage locations.

- **Step 4.3:** Review the list of locations and **double-click** on the desired target location to select it.

- **Step 4.4:** The selected location will be populated in the Location field on the Internal Movement screen.

  ![image5](/IMAGE/IntrenalMovement/image5.png)
  ![image6](/IMAGE/IntrenalMovement/image6.png)
  

---

## 5. Validate Selected Location

Confirm the target location selection for internal movement.

- **Step 5.1:** After selecting the location by double-clicking, the system will validate the location.

- **Step 5.2:** A confirmation message will be displayed: **"Valid location scanned"**.

- **Step 5.3:** The validated location will be confirmed as the target destination for the internal movement.

![image7](/IMAGE/IntrenalMovement/image7.png)


---

## 6. Execute Internal Movement Transfer

Complete the internal movement process by transferring materials to the target location.

- **Step 6.1:** Review all scanned material details displayed in the materials table.
- **Step 6.2:** Verify that all materials are correctly scanned and the target location is accurate.

- **Step 6.3:** After scanning or selecting the location, click the **Transfer** button to execute the internal movement operation.

- **Step 6.4:** The system will process the internal movement transaction and update the inventory records.

- **Step 6.5:** A confirmation message will appear upon successful completion of the internal movement.

- **Step 6.6:** The materials will be recorded as moved from their current location to the selected target location.

  ![image8](/IMAGE/IntrenalMovement/image8.png)

---

## Summary

- **Open Internal Movement Module:** Click on FG Internal Movement menu to display the Internal Movement screen.
- **Scan Material:** Scan material barcode to retrieve details. System displays "Invalid barcode scanned" for invalid barcodes or shows complete material information for valid barcodes.
- **Remove Material:** Select and click Remove button, then scan the valid material to remove it from the materials list.
- **Select Location:** Click Location Symbol to display all available locations, then double-click on the desired location for selection.
- **Validate Location:** System displays "Valid location scanned" message after successful location selection.
- **Execute Transfer:** After scanning or selecting the location, click Transfer button to complete the internal movement operation.

---