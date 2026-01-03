// app.js - Versión con lema "Te la deja lista pa' chambear" en fuente bonita (Pacifico)
// Helper: carga imagen local y devuelve DataURL
async function cargarImagenDataURL(ruta) {
  try {
    const res = await fetch(ruta);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Error cargando imagen:', ruta, e);
    return null;
  }
}

// Helper: carga TTF y devuelve base64 sin prefijo (para addFileToVFS)
async function cargarTTFaBase64(rutaTTF) {
  try {
    const res = await fetch(rutaTTF);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      const slice = bytes.subarray(i, i + chunk);
      binary += String.fromCharCode.apply(null, slice);
    }
    return btoa(binary);
  } catch (e) {
    console.warn('No se pudo cargar TTF:', rutaTTF, e);
    return null;
  }
}

(function () {
  const cliente = document.getElementById('cliente');
  const fecha = document.getElementById('fecha');
  const tbody = document.querySelector('#productos tbody');
  const addRowBtn = document.getElementById('addRow');
  const clearRowsBtn = document.getElementById('clearRows');
  const totalEl = document.getElementById('total');
  const generatePdfBtn = document.getElementById('generatePdf');

  // Numeración de boleta desde localStorage
  let boletaNumber = parseInt(localStorage.getItem('boletaNumber')) || 1;

  function updateDate() {
    const now = new Date();
    fecha.textContent = 'Fecha: ' + now.toLocaleString();
  }

  // Crear fila editable
  function createRow(product = '', price = '0.00', qty = '1', importe = '0.00') {
    const tr = document.createElement('tr');

    const tdProd = document.createElement('td');
    const inpProd = document.createElement('input');
    inpProd.value = product;
    tdProd.appendChild(inpProd);

    const tdPrice = document.createElement('td');
    const inpPrice = document.createElement('input');
    inpPrice.type = 'number';
    inpPrice.step = '0.01';
    inpPrice.min = '0';
    inpPrice.value = price;
    tdPrice.appendChild(inpPrice);

    const tdQty = document.createElement('td');
    const inpQty = document.createElement('input');
    inpQty.type = 'number';
    inpQty.step = '1';
    inpQty.min = '0';
    inpQty.value = qty;
    tdQty.appendChild(inpQty);

    const tdImporte = document.createElement('td');
    tdImporte.textContent = importe;

    const tdRemove = document.createElement('td');
    const btnRemove = document.createElement('button');
    btnRemove.textContent = 'X';
    btnRemove.className = 'remove-btn';
    tdRemove.appendChild(btnRemove);

    tr.append(tdProd, tdPrice, tdQty, tdImporte, tdRemove);

    function recalc() {
      const p = parseFloat(inpPrice.value || '0');
      const q = parseInt(inpQty.value || '0');
      const imp = (Math.round(p * q * 100) / 100).toFixed(2);
      tdImporte.textContent = imp;
      updateTotal();
    }

    inpPrice.addEventListener('input', recalc);
    inpQty.addEventListener('input', recalc);
    btnRemove.addEventListener('click', () => {
      tr.remove();
      updateTotal();
    });

    tbody.appendChild(tr);
  }

  // Actualizar total visible
  function updateTotal() {
    let total = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
      const v = parseFloat(tr.children[3].textContent || '0') || 0;
      total += v;
    });
    totalEl.textContent = total.toFixed(2);
  }

  addRowBtn.addEventListener('click', () => createRow());
  clearRowsBtn.addEventListener('click', () => {
    tbody.innerHTML = '';
    updateTotal();
  });

  // Texto exacto del slogan adicional (pequeño)
  const LEMA_CORTO = "Te la deja lista pa' chambear";
  // Texto largo (slogan original se mantiene donde estaba)
  const SLOGAN_EXACTO = "Ofrecemos mantenimiento preventivo, reparación de motores y sistemas eléctricos, así como modificaciones y mejoras del motor. Dejamos su moto en perfecto estado y respaldada con garantía.";

  // ---------- Generar PDF (con font embedding si está disponible) ----------
  generatePdfBtn.addEventListener('click', async () => {
    const clienteText = cliente.value || 'Cliente';
    const fechaText = new Date().toLocaleString();
    const rows = [];

    tbody.querySelectorAll('tr').forEach(tr => {
      const prod = tr.children[0].firstChild.value || '';
      const price = parseFloat(tr.children[1].firstChild.value || '0') || 0;
      const qty = parseInt(tr.children[2].firstChild.value || '0') || 0;
      const imp = parseFloat(tr.children[3].textContent || '0') || 0;
      if (prod.trim() !== '' && imp > 0) {
        rows.push([prod, price.toFixed(2), qty.toString(), imp.toFixed(2)]);
      }
    });

    if (rows.length === 0) {
      alert('Agrega al menos un producto válido.');
      return;
    }

    // Cargar imágenes (logoLV y moto)
    const logoData = await cargarImagenDataURL('logoLV.png');
    const motoData = await cargarImagenDataURL('moto.png');

    // Intención: intentar cargar fuente Pacifico (o cualquier TTF con ese nombre)
    const fontBase64 = await cargarTTFaBase64('Pacifico-Regular.ttf'); // coloca Pacifico-Regular.ttf en la misma carpeta
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Si pudimos cargar la TTF, incrustarla en jsPDF y registrarla
    let pudoFont = false;
    if (fontBase64) {
      try {
        // nombre usado: Pacifico.ttf (puede ser cualquier)
        doc.addFileToVFS('Pacifico.ttf', fontBase64);
        doc.addFont('Pacifico.ttf', 'Pacifico', 'normal');
        pudoFont = true;
      } catch (e) {
        console.warn('No se pudo incrustar fuente en jsPDF:', e);
        pudoFont = false;
      }
    }

    // Colores
    const azulOscuro = [11, 63, 130];
    const celesteClaro = [235, 245, 255];

    // Marca de agua (logo centrado y translúcido)
    if (logoData) {
      try {
        if (typeof doc.setGState === 'function') {
          doc.setGState(new doc.GState({ opacity: 0.09 }));
        }
      } catch (e) {}
      const watermarkSize = 110;
      doc.addImage(logoData, 'PNG', (pageW - watermarkSize) / 2, (pageH - watermarkSize) / 2 + 10, watermarkSize, watermarkSize);
      try { if (typeof doc.setGState === 'function') doc.setGState(new doc.GState({ opacity: 1 })); } catch (e) {}
    }

    // Moto en esquina superior derecha
    let motoPresent = false;
    if (motoData) {
      motoPresent = true;
      const motoW = 48;
      const motoH = 40;
      const motoX = pageW - margin - motoW;
      const motoY = 12;
      doc.addImage(motoData, 'PNG', motoX, motoY, motoW, motoH);
    }

    // ===== Encabezado: Título =====
    const titleY = 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...azulOscuro);
    doc.text('El Chino Mecánico', pageW / 2, titleY, { align: 'center' });

    // ===== LEMA CORTO debajo del título con fuente bonita (si se pudo incrustar), si no usa helvetica-italic =====
    const lemaY = titleY + 6;
    if (pudoFont) {
      try {
        doc.setFont('Pacifico', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(10, 90, 170); // color celeste/azul
        doc.text(LEMA_CORTO, pageW / 2, lemaY, { align: 'center' });
      } catch (e) {
        // fallback
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.setTextColor(10, 90, 170);
        doc.text(LEMA_CORTO, pageW / 2, lemaY, { align: 'center' });
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(10, 90, 170);
      doc.text(LEMA_CORTO, pageW / 2, lemaY, { align: 'center' });
    }

    // ===== Slogan largo original (debajo del lema corto) =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40);
    const sloganRightLimit = (motoPresent) ? (pageW - margin - 52) : (pageW - margin);
    const sloganMaxWidth = sloganRightLimit - margin;
    const sloganLines = doc.splitTextToSize(SLOGAN_EXACTO, sloganMaxWidth);
    doc.text(sloganLines, margin, lemaY + 6);

    // Línea decorativa
    const headerBottomY = lemaY + 6 + sloganLines.length * 4 + 10;
    doc.setDrawColor(...azulOscuro);
    doc.setLineWidth(0.8);
    doc.line(margin, headerBottomY, pageW - margin, headerBottomY);

    // Datos cliente / fecha / boleta
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(`Cliente: ${clienteText}`, margin, headerBottomY + 8);
    doc.text(`Fecha: ${fechaText}`, pageW - margin, headerBottomY + 8, { align: 'right' });
    doc.text(`Boleta N°: ${boletaNumber}`, pageW - margin, headerBottomY + 14, { align: 'right' });

    // Tabla con anchos fijos para evitar desbordes
    const contentWidth = pageW - margin * 2;
    const colProducto = Math.round(contentWidth * 0.505);
    const colPrecio = Math.round(contentWidth * 0.176);
    const colCantidad = Math.round(contentWidth * 0.118);
    const colImporte = contentWidth - (colProducto + colPrecio + colCantidad);

    doc.autoTable({
      startY: headerBottomY + 18,
      head: [['Producto', 'P. Unit. (S/.)', 'Cantidad', 'Importe (S/.)']],
      body: rows,
      theme: 'striped',
      headStyles: {
        fillColor: azulOscuro,
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: celesteClaro },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: colProducto, halign: 'left' },
        1: { cellWidth: colPrecio, halign: 'right' },
        2: { cellWidth: colCantidad, halign: 'center' },
        3: { cellWidth: colImporte, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    // TOTAL
    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 8 : headerBottomY + 60;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...azulOscuro);
    const total = totalEl.textContent || '0.00';
    doc.text(`TOTAL S/. ${parseFloat(total).toFixed(2)}`, pageW - margin, finalY + 6, { align: 'right' });

    // Pie
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Gracias por su preferencia - El Chino Mecánico', pageW / 2, pageH - 12, { align: 'center' });

    // Incrementar número de boleta
    localStorage.setItem('boletaNumber', ++boletaNumber);

    // Guardar PDF
    doc.save(`Boleta_ElChinoMecanico_${boletaNumber}.pdf`);
  });

  // Inicializar
  updateDate();
  setInterval(updateDate, 60 * 1000);
  createRow();
  createRow();
  updateTotal();
})();
