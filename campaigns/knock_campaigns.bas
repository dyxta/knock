Sub BuildKnockCampaignSheet()

    Dim wb As Workbook
    Dim oppSh As Worksheet, camSh As Worksheet
    Dim i As Long

    ' Colours
    Const BLACK  As Long = 0
    Const PURPLE As Long = 6231787   ' #5E17EB
    Const WHITE  As Long = 16777215
    Const LIGHT  As Long = 16044285  ' #F4F0FD

    Set wb = ThisWorkbook

    ' ─────────────────────────────────────────────────────────────────────
    ' 1. OPPORTUNITIES SHEET
    ' ─────────────────────────────────────────────────────────────────────
    On Error Resume Next
    Set oppSh = wb.Sheets("Opportunities")
    On Error GoTo 0
    If oppSh Is Nothing Then
        Set oppSh = wb.Sheets.Add(After:=wb.Sheets(wb.Sheets.Count))
        oppSh.Name = "Opportunities"
    Else
        oppSh.Cells.Clear
    End If
    oppSh.Tab.Color = PURPLE

    ' Headers
    Dim oppHeaders As Variant
    oppHeaders = Array("ID", "Name", "Type", "Company", "Destination URL", "Created")
    Dim h As Integer
    For h = 0 To UBound(oppHeaders)
        With oppSh.Cells(1, h + 1)
            .Value = oppHeaders(h)
            .Interior.Color = BLACK
            .Font.Color = WHITE
            .Font.Bold = True
            .Font.Size = 10
        End With
    Next h

    ' Column widths
    oppSh.Columns(1).ColumnWidth = 8
    oppSh.Columns(2).ColumnWidth = 28
    oppSh.Columns(3).ColumnWidth = 14
    oppSh.Columns(4).ColumnWidth = 20
    oppSh.Columns(5).ColumnWidth = 45
    oppSh.Columns(6).ColumnWidth = 14

    ' Formulas + alternating rows (2–200)
    For i = 2 To 200
        oppSh.Cells(i, 1).Formula = "=IF(B" & i & "<>"""",""OPP-""&TEXT(ROW()-1,""000""),"""")"
        oppSh.Cells(i, 6).Formula = "=IF(B" & i & "<>"""",TEXT(TODAY(),""dd mmm yyyy""),"""")"
        If i Mod 2 = 0 Then
            oppSh.Range(oppSh.Cells(i, 1), oppSh.Cells(i, 6)).Interior.Color = LIGHT
        Else
            oppSh.Range(oppSh.Cells(i, 1), oppSh.Cells(i, 6)).Interior.Color = WHITE
        End If
    Next i

    ' Type dropdown
    With oppSh.Range("C2:C200").Validation
        .Delete
        .Add Type:=xlValidateList, Formula1:="Job,Bursary,Internship"
        .ShowError = True
    End With

    ' Freeze header row
    oppSh.Activate
    oppSh.Rows(2).Select
    ActiveWindow.FreezePanes = True

    ' Sample row
    oppSh.Range("B2").Value = "ABSA Grad Programme 2025"
    oppSh.Range("C2").Value = "Job"
    oppSh.Range("D2").Value = "ABSA"
    oppSh.Range("E2").Value = "https://absa.co.za/careers/grad-programme"

    ' ─────────────────────────────────────────────────────────────────────
    ' 2. CAMPAIGNS SHEET
    ' ─────────────────────────────────────────────────────────────────────
    On Error Resume Next
    Set camSh = wb.Sheets("Campaigns")
    On Error GoTo 0
    If camSh Is Nothing Then
        Set camSh = wb.Sheets.Add(After:=oppSh)
        camSh.Name = "Campaigns"
    Else
        camSh.Cells.Clear
    End If
    camSh.Tab.Color = PURPLE

    ' Headers
    Dim camHeaders As Variant
    camHeaders = Array("ID", "Opportunity", "University", "Group Name", "Wave / Medium", "Generated URL", "Created", "Notes")
    For h = 0 To UBound(camHeaders)
        With camSh.Cells(1, h + 1)
            .Value = camHeaders(h)
            .Interior.Color = BLACK
            .Font.Color = WHITE
            .Font.Bold = True
            .Font.Size = 10
        End With
    Next h

    ' Column widths
    camSh.Columns(1).ColumnWidth = 10
    camSh.Columns(2).ColumnWidth = 26
    camSh.Columns(3).ColumnWidth = 16
    camSh.Columns(4).ColumnWidth = 22
    camSh.Columns(5).ColumnWidth = 18
    camSh.Columns(6).ColumnWidth = 60
    camSh.Columns(7).ColumnWidth = 14
    camSh.Columns(8).ColumnWidth = 28

    ' Opportunity dropdown (pulls from Opportunities col B)
    With camSh.Range("B2:B200").Validation
        .Delete
        .Add Type:=xlValidateList, Formula1:="=Opportunities!$B$2:$B$200"
        .ShowError = True
    End With

    ' Formulas + alternating rows + URL column styling
    For i = 2 To 200
        ' Campaign ID
        camSh.Cells(i, 1).Formula = "=IF(B" & i & "<>"""",""CAM-""&TEXT(ROW()-1,""000""),"""")"

        ' URL builder — ENCODEURL encodes the destination, utm params built from group + wave
        camSh.Cells(i, 6).Formula = _
            "=IF(AND(B" & i & "<>"""",D" & i & "<>"""",E" & i & "<>"""")," & _
            """https://campaigns.knocktalent.co.za/?dest=""" & _
            "&ENCODEURL(IFERROR(VLOOKUP(B" & i & ",Opportunities!B:E,4,FALSE),""""))" & _
            "&""&utm_source=""&SUBSTITUTE(LOWER(D" & i & "),"" "",""_"")" & _
            "&""&utm_medium=""&SUBSTITUTE(LOWER(E" & i & "),"" "",""_"")," & _
            """"""")"

        ' Created date
        camSh.Cells(i, 7).Formula = "=IF(B" & i & "<>"""",TEXT(TODAY(),""dd mmm yyyy""),"""")"

        ' Alternating row colour
        If i Mod 2 = 0 Then
            camSh.Range(camSh.Cells(i, 1), camSh.Cells(i, 8)).Interior.Color = LIGHT
        Else
            camSh.Range(camSh.Cells(i, 1), camSh.Cells(i, 8)).Interior.Color = WHITE
        End If

        ' URL column — purple + bold
        With camSh.Cells(i, 6)
            .Font.Color = PURPLE
            .Font.Bold = True
        End With
    Next i

    ' Freeze header
    camSh.Activate
    camSh.Rows(2).Select
    ActiveWindow.FreezePanes = True

    ' Sample row
    camSh.Range("B2").Value = "ABSA Grad Programme 2025"
    camSh.Range("C2").Value = "Wits"
    camSh.Range("D2").Value = "wits_commerce_2025"
    camSh.Range("E2").Value = "wave1_core"
    camSh.Range("H2").Value = "First wave — commerce subgroup"

    ' ─────────────────────────────────────────────────────────────────────
    ' 3. Remove default Sheet1 if present
    ' ─────────────────────────────────────────────────────────────────────
    Application.DisplayAlerts = False
    On Error Resume Next
    wb.Sheets("Sheet1").Delete
    On Error GoTo 0
    Application.DisplayAlerts = True

    ' Land on Opportunities to start
    oppSh.Activate
    oppSh.Range("B2").Select

    MsgBox "Knock Campaign Sheet built." & vbNewLine & vbNewLine & _
           "1. Opportunities tab — add your opportunities first." & vbNewLine & _
           "2. Campaigns tab — pick an opportunity, fill in group name + wave, URL builds automatically.", _
           vbInformation, "Knock Intelligence"

End Sub
