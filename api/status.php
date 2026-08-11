<?php
// =============================================
// Frind Phone — Legacy order status API
// =============================================
// This endpoint is intentionally disabled after removing the order-tracking feature.

require_once 'db.php';

header('Content-Type: application/json');
jsonResponse(['success' => false, 'error' => 'Order tracking is disabled'], 404);
?>
