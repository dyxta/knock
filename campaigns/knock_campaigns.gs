function buildKnockCampaignSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Colour palette ──────────────────────────────────────────────────────────
  var BLACK   = "#000000";
  var PURPLE  = "#5E17EB";
  var WHITE   = "#FFFFFF";
  var LIGHT   = "#F4F0FD";
  var GREY    = "#CCCCCC";
  var GREEN   = "#34A853";

  // ══════════════════════════════════════════════════════════════════════════
  // 1. OPPORTUNITIES SHEET
  // ══════════════════════════════════════════════════════════════════════════
  var oppSheet = ss.getSheetByName("Opportunities") || ss.insertSheet("Opportunities");
  oppSheet.clear();
  oppSheet.setTabColor(PURPLE);

  // Header row
  var oppHeaders = ["ID", "Name", "Type", "Company", "Destination URL", "Created"];
  oppSheet.getRange(1, 1, 1, oppHeaders.length).setValues([oppHeaders])
    .setBackground(BLACK)
    .setFontColor(WHITE)
    .setFontWeight("bold")
    .setFontSize(10);

  // Column widths
  oppSheet.setColumnWidth(1, 60);
  oppSheet.setColumnWidth(2, 220);
  oppSheet.setColumnWidth(3, 120);
  oppSheet.setColumnWidth(4, 160);
  oppSheet.setColumnWidth(5, 320);
  oppSheet.setColumnWidth(6, 120);

  // Auto ID formula (rows 2–200)
  for (var i = 2; i <= 200; i++) {
    oppSheet.getRange(i, 1).setFormula('=IF(B' + i + '<>"","OPP-"&TEXT(ROW()-1,"000"),"")');
    oppSheet.getRange(i, 6).setFormula('=IF(B' + i + '<>"",IF(F' + i + '="",TEXT(NOW(),"dd mmm yyyy"),F' + i + '),"")');
  }

  // Type dropdown
  var oppTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Job", "Bursary", "Internship"], true)
    .setAllowInvalid(false)
    .build();
  oppSheet.getRange(2, 3, 199, 1).setDataValidation(oppTypeRule);

  // Alternating row colour
  for (var r = 2; r <= 200; r++) {
    oppSheet.getRange(r, 1, 1, oppHeaders.length)
      .setBackground(r % 2 === 0 ? LIGHT : WHITE);
  }

  // Freeze header
  oppSheet.setFrozenRows(1);

  // Sample row
  oppSheet.getRange("B2").setValue("ABSA Grad Programme 2025");
  oppSheet.getRange("C2").setValue("Job");
  oppSheet.getRange("D2").setValue("ABSA");
  oppSheet.getRange("E2").setValue("https://absa.co.za/careers/grad-programme");

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CAMPAIGNS SHEET
  // ══════════════════════════════════════════════════════════════════════════
  var camSheet = ss.getSheetByName("Campaigns") || ss.insertSheet("Campaigns");
  camSheet.clear();
  camSheet.setTabColor(PURPLE);

  var camHeaders = [
    "ID", "Opportunity", "University", "Group Name",
    "Wave / Medium", "Generated URL", "Created", "Notes"
  ];
  camSheet.getRange(1, 1, 1, camHeaders.length).setValues([camHeaders])
    .setBackground(BLACK)
    .setFontColor(WHITE)
    .setFontWeight("bold")
    .setFontSize(10);

  // Column widths
  camSheet.setColumnWidth(1, 80);
  camSheet.setColumnWidth(2, 200);
  camSheet.setColumnWidth(3, 140);
  camSheet.setColumnWidth(4, 160);
  camSheet.setColumnWidth(5, 140);
  camSheet.setColumnWidth(6, 420);
  camSheet.setColumnWidth(7, 120);
  camSheet.setColumnWidth(8, 200);

  // Opportunity dropdown (pulls live from Opportunities!B column)
  var oppNameRange  = oppSheet.getRange("B2:B200");
  var oppNameValues = oppNameRange.getValues().flat().filter(String);
  var camOppRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(oppNameValues.length ? oppNameValues : ["— add opportunities first —"], true)
    .setAllowInvalid(false)
    .build();
  camSheet.getRange(2, 2, 199, 1).setDataValidation(camOppRule);

  // Auto ID + Generated URL + Created formulas
  for (var j = 2; j <= 200; j++) {
    // Campaign ID
    camSheet.getRange(j, 1)
      .setFormula('=IF(B' + j + '<>"","CAM-"&TEXT(ROW()-1,"000"),"")');

    // URL builder — encodes the destination URL looked up from Opportunities sheet,
    // appends utm_source (group name) and utm_medium (wave)
    camSheet.getRange(j, 6)
      .setFormula(
        '=IF(AND(B' + j + '<>"",D' + j + '<>"",E' + j + '<>""),' +
        '"https://campaigns.knocktalent.co.za/?dest="' +
        '&ENCODEURL(IFERROR(VLOOKUP(B' + j + ',Opportunities!B:E,4,FALSE),""))' +
        '&"&utm_source="&SUBSTITUTE(LOWER(D' + j + ')," ","_")' +
        '&"&utm_medium="&SUBSTITUTE(LOWER(E' + j + ')," ","_")' +
        ',"")'
      );

    // Created date
    camSheet.getRange(j, 7)
      .setFormula('=IF(B' + j + '<>"",IF(G' + j + '="",TEXT(NOW(),"dd mmm yyyy"),G' + j + '),"")');
  }

  // Alternating row colour
  for (var s = 2; s <= 200; s++) {
    camSheet.getRange(s, 1, 1, camHeaders.length)
      .setBackground(s % 2 === 0 ? LIGHT : WHITE);
  }

  // Make URL column purple + bold so it stands out
  camSheet.getRange(2, 6, 199, 1)
    .setFontColor(PURPLE)
    .setFontWeight("bold");

  camSheet.setFrozenRows(1);

  // Sample row
  camSheet.getRange("B2").setValue("ABSA Grad Programme 2025");
  camSheet.getRange("C2").setValue("Wits");
  camSheet.getRange("D2").setValue("wits_commerce_2025");
  camSheet.getRange("E2").setValue("wave1_core");
  camSheet.getRange("H2").setValue("First wave — commerce subgroup");

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DELETE default Sheet1 if it still exists
  // ══════════════════════════════════════════════════════════════════════════
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  // ══════════════════════════════════════════════════════════════════════════
  // Done
  // ══════════════════════════════════════════════════════════════════════════
  SpreadsheetApp.getUi().alert(
    "Knock Campaign Sheet built successfully.\n\n" +
    "→ Opportunities tab: add your opportunities here first.\n" +
    "→ Campaigns tab: select an opportunity, fill in university, group name and wave — the URL builds automatically."
  );
}
