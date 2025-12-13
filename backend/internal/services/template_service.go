package services

import (
	"bytes"

	"github.com/xuri/excelize/v2"
	"github.com/wei979/ICACP/backend/internal/models"
)

// TemplateService handles Excel template generation
type TemplateService struct{}

// NewTemplateService creates a new TemplateService
func NewTemplateService() *TemplateService {
	return &TemplateService{}
}

// GenerateStudentTemplate creates a student list Excel template
func (s *TemplateService) GenerateStudentTemplate() (*bytes.Buffer, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheetName := "學生名單"
	f.SetSheetName("Sheet1", sheetName)

	// Set column widths
	f.SetColWidth(sheetName, "A", "A", 10)  // 座號
	f.SetColWidth(sheetName, "B", "B", 15)  // 姓名
	f.SetColWidth(sheetName, "C", "C", 10)  // 性別
	f.SetColWidth(sheetName, "D", "D", 10)  // 年級
	f.SetColWidth(sheetName, "E", "E", 10)  // 班級
	f.SetColWidth(sheetName, "F", "F", 15)  // 生日

	// Create header style
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 12,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#E2EFDA"},
			Pattern: 1,
		},
		Border: []excelize.Border{
			{Type: "left", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "bottom", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
	})

	// Write headers
	headers := models.StudentTemplateHeaders
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}

	// Add example data (row 2)
	exampleData := []interface{}{1, "王小明", "男", 3, "甲", "2015/03/15"}
	for i, value := range exampleData {
		cell, _ := excelize.CoordinatesToCellName(i+1, 2)
		f.SetCellValue(sheetName, cell, value)
	}

	// Add another example (row 3)
	exampleData2 := []interface{}{2, "李小華", "女", 3, "甲", "2015/07/22"}
	for i, value := range exampleData2 {
		cell, _ := excelize.CoordinatesToCellName(i+1, 3)
		f.SetCellValue(sheetName, cell, value)
	}

	// Add gender dropdown validation (C2:C1000)
	genderDV := excelize.NewDataValidation(true)
	genderDV.Sqref = "C2:C1000"
	genderDV.SetDropList([]string{"男", "女"})
	genderDV.SetError(excelize.DataValidationErrorStyleStop, "錯誤", "請選擇「男」或「女」")
	f.AddDataValidation(sheetName, genderDV)

	// Add grade validation (D2:D1000) - whole number between 1 and 12
	gradeDV := excelize.NewDataValidation(true)
	gradeDV.Sqref = "D2:D1000"
	gradeDV.SetRange(1, 12, excelize.DataValidationTypeWhole, excelize.DataValidationOperatorBetween)
	gradeDV.SetError(excelize.DataValidationErrorStyleStop, "錯誤", "年級必須是 1-12 的整數")
	f.AddDataValidation(sheetName, gradeDV)

	// Add instructions sheet
	instructionSheet := "使用說明"
	f.NewSheet(instructionSheet)
	f.SetColWidth(instructionSheet, "A", "A", 80)

	instructions := []string{
		"學生名單批次匯入模板 - 使用說明",
		"",
		"欄位說明：",
		"• 座號* (必填)：學生在班級中的座號",
		"• 姓名* (必填)：學生姓名，最多 50 字元",
		"• 性別* (必填)：選擇「男」或「女」",
		"• 年級* (必填)：1-12 的整數",
		"• 班級 (選填)：班級名稱，如「甲」、「A」、「1」等",
		"• 生日 (選填)：日期格式，如 2015/03/15 或 2015-03-15",
		"",
		"注意事項：",
		"1. 請勿修改第一列的標題欄位",
		"2. 請從第二列開始填寫資料",
		"3. 帶有 * 號的欄位為必填",
		"4. 同一份檔案中座號不可重複",
		"5. 範例資料可覆蓋或刪除",
	}

	for i, text := range instructions {
		cell, _ := excelize.CoordinatesToCellName(1, i+1)
		f.SetCellValue(instructionSheet, cell, text)
	}

	// Set active sheet to main sheet
	idx, _ := f.GetSheetIndex(sheetName)
	f.SetActiveSheet(idx)

	// Write to buffer
	buffer := new(bytes.Buffer)
	if err := f.Write(buffer); err != nil {
		return nil, err
	}

	return buffer, nil
}

// GenerateRecordsTemplate creates a sport records Excel template
func (s *TemplateService) GenerateRecordsTemplate() (*bytes.Buffer, error) {
	f := excelize.NewFile()
	defer f.Close()

	sheetName := "運動記錄"
	f.SetSheetName("Sheet1", sheetName)

	// Set column widths
	f.SetColWidth(sheetName, "A", "A", 10)  // 座號
	f.SetColWidth(sheetName, "B", "B", 15)  // 姓名
	f.SetColWidth(sheetName, "C", "C", 12)  // 身高
	f.SetColWidth(sheetName, "D", "D", 12)  // 體重
	f.SetColWidth(sheetName, "E", "E", 15)  // 坐姿體前彎
	f.SetColWidth(sheetName, "F", "F", 12)  // 立定跳遠
	f.SetColWidth(sheetName, "G", "G", 18)  // 仰臥起坐
	f.SetColWidth(sheetName, "H", "H", 12)  // 心肺耐力
	f.SetColWidth(sheetName, "I", "I", 15)  // 測驗日期

	// Create header style
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
			Size: 12,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#DDEBF7"},
			Pattern: 1,
		},
		Border: []excelize.Border{
			{Type: "left", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "bottom", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
	})

	// Write headers
	headers := models.RecordsTemplateHeaders
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}

	// Add example data (row 2)
	exampleData := []interface{}{1, "王小明", 125.5, 28.3, 15, 120, 25, 480, "2025/03/15"}
	for i, value := range exampleData {
		cell, _ := excelize.CoordinatesToCellName(i+1, 2)
		f.SetCellValue(sheetName, cell, value)
	}

	// Add another example (row 3) - partial fill
	exampleData2 := []interface{}{2, "李小華", 122.0, 26.5, "", "", "", "", "2025/03/15"}
	for i, value := range exampleData2 {
		cell, _ := excelize.CoordinatesToCellName(i+1, 3)
		f.SetCellValue(sheetName, cell, value)
	}

	// Add instructions sheet
	instructionSheet := "使用說明"
	f.NewSheet(instructionSheet)
	f.SetColWidth(instructionSheet, "A", "A", 80)

	instructions := []string{
		"運動記錄批次匯入模板 - 使用說明",
		"",
		"欄位說明：",
		"• 座號* (必填)：學生在班級中的座號",
		"• 姓名* (必填)：學生姓名（需與系統中已存在的學生匹配）",
		"• 身高(cm) (選填)：身高，單位公分",
		"• 體重(kg) (選填)：體重，單位公斤",
		"• 坐姿體前彎(cm) (選填)：坐姿體前彎成績，單位公分",
		"• 立定跳遠(cm) (選填)：立定跳遠成績，單位公分",
		"• 仰臥起坐(次/分鐘) (選填)：一分鐘內完成次數",
		"• 心肺耐力(秒) (選填)：心肺耐力測驗時間，單位秒",
		"• 測驗日期* (必填)：測驗日期，如 2025/03/15",
		"",
		"注意事項：",
		"1. 請勿修改第一列的標題欄位",
		"2. 請從第二列開始填寫資料",
		"3. 座號 + 姓名 必須對應系統中已存在的學生",
		"4. 運動項目可以只填寫部分（如只測了身高體重）",
		"5. 空白的運動項目會自動跳過",
		"6. 系統會新增記錄，不會覆蓋既有資料",
		"7. 超出合理範圍的數值會顯示警告，但仍可匯入",
		"",
		"合理值範圍參考：",
		"• 身高：80-250 cm",
		"• 體重：10-200 kg",
		"• 坐姿體前彎：-30 至 60 cm",
		"• 立定跳遠：20-350 cm",
		"• 仰臥起坐：0-100 次",
		"• 心肺耐力：60-1800 秒",
	}

	for i, text := range instructions {
		cell, _ := excelize.CoordinatesToCellName(1, i+1)
		f.SetCellValue(instructionSheet, cell, text)
	}

	// Set active sheet to main sheet
	idx, _ := f.GetSheetIndex(sheetName)
	f.SetActiveSheet(idx)

	// Write to buffer
	buffer := new(bytes.Buffer)
	if err := f.Write(buffer); err != nil {
		return nil, err
	}

	return buffer, nil
}
