# Stock Transfer Receipt Module Process

This document outlines the steps involved in **accessing the Stock Transfer Receipt module**, **selecting transfer orders**, **viewing receipt details**, **scanning materials**, and **completing receipt operations** using the Stock Transfer Receipt Module.

---

## 1. Open Stock Transfer Receipt Module

Access the Stock Transfer Receipt screen from the application menu.

- **Step 1.1:** Navigate to **Stock Transfer Receipt** from the application menu.

- **Step 1.2:** The **Stock Transfer Receipt** screen will be displayed with transfer order selection and material receipt options.
  <img src="/IMAGE/StockTransferReceipt/image1.png" width="400" alt="image1">

---

## 2. Select Stock Transfer Number

Choose a stock transfer order to receive materials.

- **Step 2.1:** Locate the **Stock Transfer No** dropdown field on the Stock Transfer Receipt screen.

- **Step 2.2:** Click on the **Stock Transfer No** dropdown to view all available transfer orders that are ready for receipt.

- **Step 2.3:** The system will display a list of all pending stock transfer numbers that have been picked and are awaiting receipt.

- **Step 2.4:** Select the desired Stock Transfer No from the dropdown list.

- **Step 2.5:** After selecting the Stock Transfer No, the system will automatically retrieve and display all transfer order details.

- **Step 2.6:** The details will be shown in the table below.

- **Step 2.7:** Review the transfer order details to verify the materials that need to be received.

  <img src="/IMAGE/StockTransferReceipt/image2.png" width="400" alt="image2">
  

---
## 3. Validate Transfer Order Picking Status

Verify that materials have been picked for the selected transfer order.

- **Step 3.1:** After selecting the Stock Transfer No, the system will validate whether materials have been picked against this transfer order.

- **Step 3.2:** If no materials have been picked for this Stock Transfer No, an error message will be displayed.

  <img src="/IMAGE/StockTransferReceipt/image3.png" width="400" alt="image3">

---

## 4. Scan Material Barcode for Receipt

Scan materials to receive them at the destination location.

- **Step 4.1:** After validating the transfer order status, focus on the **Material Barcode** scan field.

- **Step 4.2:** Scan the material barcode using the scanner device for the materials that need to be received.

- **Step 4.3:** The system will validate the scanned barcode against the materials in the selected transfer order.

### 4.1 Valid Barcode Scenario

- **Step 4.3.1:** If the scanned barcode is valid and matches one of the materials in the transfer order, a success message will be displayed.

- **Step 4.3.2:** The system will confirm that the material has been successfully scanned for receipt.

- **Step 4.3.3:** The material will be marked for receipt and go for put away.

- **Step 4.3.4:** The user will be redirected or prompted to complete the put away operation for the received material.

- **Step 4.3.5:** The inventory will be updated to reflect the material receipt at the destination location.
  <img src="/IMAGE/StockTransferReceipt/image4.png" width="400" alt="image4">


---

## 5. Complete Receipt and Refresh Transfer Orders

Finalize the receipt process and update the transfer order list.

- **Step 5.1:** After all materials from the selected Stock Transfer No have been scanned and received, the receipt process will be marked as completed.

- **Step 5.2:** The system will update the inventory records and mark the Stock Transfer No as fully received.

- **Step 5.3:** Once the receipt is completed, the **Stock Transfer No** dropdown will automatically refresh.

- **Step 5.4:** The completed Stock Transfer No will be removed from the dropdown list as it no longer requires receipt operations.

- **Step 5.5:** The dropdown will now display only the pending transfer orders that are still awaiting receipt.

- **Step 5.6:** The user can select another Stock Transfer No from the refreshed dropdown list to continue receiving materials from other transfer orders.

- **Step 5.7:** A completion message may be displayed confirming that the receipt process has been successfully completed for the transfer order.
  <img src="/IMAGE/StockTransferReceipt/image5.png" width="400" alt="image5">


---

## Summary

- **Open Stock Transfer Receipt Module:** Click on Stock Transfer Receipt menu to display the Stock Transfer Receipt screen.
- **Select Transfer Order:** Click on Stock Transfer No dropdown to display all available transfer orders ready for receipt, then select the desired order. System displays transfer details in the table below.
- **Validate Status:** System validates if materials have been picked. If no materials are picked against the Stock Transfer No, an error message is displayed.
- **Scan Material:** Scan material barcode for valid materials. System displays success message and automatically proceeds to put away process for the received material.
- **Complete Receipt:** After receipt is completed, the Stock Transfer No dropdown automatically refreshes and removes the completed transfer order, displaying only pending transfer orders.

---