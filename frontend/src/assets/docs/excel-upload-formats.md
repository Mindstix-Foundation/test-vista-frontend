# Excel/CSV Upload Formats for Question Types

This document describes the required CSV/Excel formats for uploading different types of questions.

## General Notes

- All CSV/Excel files must include column headers in the first row
- Column names are case-insensitive
- The `question` column is required for all question types
- The `is_previous_exam` column is optional for all types (use `true` or `false`)
- All uploaded questions will be marked as unverified initially

## Question Type Formats

### 1. Multiple Choice Question (MCQ)

**Required Columns:**
- `question` - The question text
- `a` - Option A
- `b` - Option B  
- `c` - Option C
- `d` - Option D
- `correct_answer` - The correct option (a, b, c, or d)

**Optional Columns:**
- `is_previous_exam` - true/false for board exam questions

**Example:**
```csv
question,a,b,c,d,correct_answer,is_previous_exam
"What is 2+2?",3,4,5,6,b,false
```

### 2. True or False

**Required Columns:**
- `question` - The statement to evaluate
- `is_true` - true or false

**Optional Columns:**
- `is_previous_exam` - true/false for board exam questions

**Example:**
```csv
question,is_true,is_previous_exam
"The earth is round",true,false
```

### 3. Match the Pairs

**Required Columns:**
- `question` - The question/instruction text
- `lhs_1`, `lhs_2` - Left side items (minimum 2 required)
- `rhs_1`, `rhs_2` - Right side items (minimum 2 required)

**Optional Columns:**
- `lhs_3`, `lhs_4`, `lhs_5` - Additional left side items
- `rhs_3`, `rhs_4`, `rhs_5` - Additional right side items
- `is_previous_exam` - true/false for board exam questions

**Example:**
```csv
question,lhs_1,lhs_2,lhs_3,rhs_1,rhs_2,rhs_3,is_previous_exam
"Match the colors",Red,Blue,Green,Apple,Sky,Grass,false
```

### 4. Fill in the Blanks

**Required Columns:**
- `question` - The sentence with blanks (use _____ for blanks)

**Optional Columns:**
- `is_previous_exam` - true/false for board exam questions

**Example:**
```csv
question,is_previous_exam
"The capital of France is _____",false
"_____ and _____ are primary colors",true
```

### 5. Descriptive Questions

For question types like:
- Odd One Out
- Complete the Correlation  
- One-Word Answer
- Give Scientific Reasons
- Short Answer Question
- Complete and Identify Reaction
- Short Note

**Required Columns:**
- `question` - The question text

**Optional Columns:**
- `is_previous_exam` - true/false for board exam questions

**Example:**
```csv
question,is_previous_exam
"Explain photosynthesis",true
"Give scientific reasons for global warming",false
```

### 6. Marks-Based Questions

For question types like:
- 2 Marks Questions
- 3 Marks Questions
- 4 Marks Questions
- 5 Marks Questions

**Required Columns:**
- `question` - The question text

**Optional Columns:**
- `is_previous_exam` - true/false for board exam questions

**Example:**
```csv
question,is_previous_exam
"Define the term derivative in calculus",false
"State the Pythagorean theorem",true
```

## File Format Support

- **CSV files** (.csv) - Use comma-separated values
- **Excel files** (.xlsx, .xls) - Use the first worksheet

## Upload Process

1. Select the question type first
2. Click the "Upload CSV/Excel" button
3. Choose your file
4. Review the preview to ensure data is correctly parsed
5. Fix any validation errors shown
6. Click "Upload" to process the questions

## Common Issues

- **Missing headers**: Ensure all required column headers are present
- **Incorrect values**: Check that correct_answer uses a, b, c, d for MCQ
- **Empty required fields**: All required columns must have values
- **File format**: Ensure file is saved as CSV or Excel format

## Tips

- Use quotes around text that contains commas
- Keep question text concise but clear
- Test with a small file first before uploading large batches
- Review the preview carefully before uploading 