// Shared order field mapping — safe to import in both client and server (API routes)

export function flattenOrder(order) {
  return {
    id: order.id,
    type: order.type,
    type_label: order.typeLabel,
    status: order.status || "submitted",
    address: order.address,
    listing_price: order.listingPrice,
    package: order.package,
    package_price: order.packagePrice,
    graphic_type: order.graphicType,
    graphic_type_label: order.graphicTypeLabel,
    design_id: order.designId,
    animation_style: order.animationStyle,
    music_style: order.musicStyle,
    postcard_type: order.postcardType,
    postcard_type_label: order.postcardTypeLabel,
    quantity: order.quantity,
    paid: order.paid || false,
    venmo_ref: order.venmoRef || "",
    delivered_files: order.deliveredFiles || [],
    delivery_message: order.deliveryMessage || "",
    admin_notes: order.adminNotes || "",
    notes: order.notes || [],
    form_data: order.formData || null,
    submitted_at: order.submittedAt || new Date().toISOString(),
    cancellation_reason: order.cancellationReason || "",
    cancelled_by: order.cancelledBy || "",
    cancelled_at: order.cancelledAt || null,
  };
}

export function expandOrder(row) {
  return {
    id: row.id,
    type: row.type,
    typeLabel: row.type_label,
    status: row.status,
    address: row.address,
    listingPrice: row.listing_price,
    package: row.package,
    packagePrice: row.package_price,
    graphicType: row.graphic_type,
    graphicTypeLabel: row.graphic_type_label,
    designId: row.design_id,
    animationStyle: row.animation_style,
    musicStyle: row.music_style,
    postcardType: row.postcard_type,
    postcardTypeLabel: row.postcard_type_label,
    quantity: row.quantity,
    paid: row.paid,
    venmoRef: row.venmo_ref,
    deliveredFiles: row.delivered_files || [],
    deliveryMessage: row.delivery_message,
    adminNotes: row.admin_notes,
    notes: row.notes || [],
    formData: row.form_data,
    submittedAt: row.submitted_at,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientBrokerage: row.client_brokerage,
    clientMobilePhone: row.client_mobile_phone,
    clientOfficePhone: row.client_office_phone,
    cancellationReason: row.cancellation_reason,
    cancelledBy: row.cancelled_by,
    cancelledAt: row.cancelled_at,
  };
}

export function flattenUpdates(updates) {
  const db = {};
  if (updates.status !== undefined)              db.status = updates.status;
  if (updates.notes !== undefined)               db.notes = updates.notes;
  if (updates.paid !== undefined)                db.paid = updates.paid;
  if (updates.venmoRef !== undefined)            db.venmo_ref = updates.venmoRef;
  if (updates.deliveredFiles !== undefined)      db.delivered_files = updates.deliveredFiles;
  if (updates.deliveryMessage !== undefined)     db.delivery_message = updates.deliveryMessage;
  if (updates.adminNotes !== undefined)          db.admin_notes = updates.adminNotes;
  if (updates.cancellationReason !== undefined)  db.cancellation_reason = updates.cancellationReason;
  if (updates.cancelledBy !== undefined)         db.cancelled_by = updates.cancelledBy;
  if (updates.cancelledAt !== undefined)         db.cancelled_at = updates.cancelledAt;
  return db;
}
