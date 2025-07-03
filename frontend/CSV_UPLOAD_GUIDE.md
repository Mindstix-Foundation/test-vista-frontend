# CSV Upload Feature for MCQ Questions

## Overview

The CSV upload feature allows administrators and teachers to bulk upload Multiple Choice Questions (MCQ) directly from a CSV file. This feature is available in the "Add Question" page when the MCQ question type is selected.

## How to Access

1. Navigate to **Question Bank** from the admin dashboard
2. Select your **Board**, **Medium**, **Standard**, **Subject**, and **Chapter**
3. Click on **Add Question**
4. In the question form, select **Topic** and **Question Type** as "Multiple Choice Question (MCQ)"
5. The **"Upload CSV (MCQ)"** button will appear next to the "Add Question" heading

## CSV File Format

Your CSV file must have the following columns with exact headers:

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| `question` | The question text | Yes | "What is the capital of France?" |
| `a` | Option A text | Yes | "Paris" |
| `b` | Option B text | Yes | "London" |
| `c` | Option C text | Optional | "Berlin" |
| `d` | Option D text | Optional | "Madrid" |
| `correct_answer` | Correct option letter (a, b, c, or d) | Yes | "a" |

### Sample CSV Content

```csv
question,a,b,c,d,correct_answer
"What is the capital of France?","Paris","London","Berlin","Madrid",a
"Which planet is closest to the Sun?","Venus","Mercury","Earth","Mars",b
"What is 2 + 2?","3","4","5","6",b
"Who wrote Romeo and Juliet?","Charles Dickens","William Shakespeare","Mark Twain","Jane Austen",b
"What is the chemical symbol for water?","H2O","CO2","NaCl","O2",a
```

## Upload Process

1. Click the **"Upload CSV (MCQ)"** button
2. A modal will open showing the CSV format requirements
3. Click **"Select CSV File"** and choose your CSV file
4. The system will automatically validate your file and show:
   - A preview of the first 3 questions
   - Total number of questions to be uploaded
   - Any validation errors (if found)
5. If there are no errors, click **"Upload X Questions"** to proceed
6. The system will upload each question individually and show progress
7. Upon completion, you'll see a summary of successful and failed uploads
8. You'll be redirected to the Question Dashboard with the new questions marked as "unverified"

## Validation Rules

The system validates the following:

### File Format
- File must have a `.csv` extension
- Must contain at least a header row and one data row

### Required Headers
- All required column headers must be present: `question`, `a`, `b`, `correct_answer`
- Headers are case-insensitive

### Data Validation
- **Question**: Cannot be empty
- **Option A & B**: Must have text (minimum 2 options required)
- **Options C & D**: Optional, can be empty
- **Correct Answer**: Must be one of: a, b, c, or d (case-insensitive)

### Row Validation
- Each row must have the same number of columns as the header
- Empty rows are skipped
- Rows with validation errors are reported but don't stop the upload of valid rows

## Important Notes

### Question Properties
- All uploaded questions are marked as **unverified** by default
- Questions are **not** marked as "previous board exam" questions
- All questions use the currently selected **topic**
- Questions use the currently selected **medium** for instruction language

### Error Handling
- Individual question failures don't stop the entire upload
- Failed questions are logged with specific error messages
- You can review failed questions in the browser console
- Successfully uploaded questions are saved even if some fail

### Best Practices
1. **Prepare your CSV carefully**: Double-check all questions and answers before uploading
2. **Start small**: Test with a few questions first before uploading large batches
3. **Verify data**: Ensure correct answers are properly marked
4. **Clean data**: Remove any special characters that might cause parsing issues
5. **Backup**: Keep a copy of your original CSV file

## Troubleshooting

### Common Issues

**"Missing required columns" error**
- Ensure your CSV has the exact headers: `question,a,b,c,d,correct_answer`
- Check for typos in column names

**"Please select a topic first" error**
- Make sure you've selected a topic in the question form before uploading CSV

**"Incorrect number of columns" error**
- Ensure each row has the same number of commas as the header row
- Check for missing commas or extra commas in your data

**Questions failing to upload**
- Check the browser console for detailed error messages
- Verify that the selected topic and chapter are valid
- Ensure question text is not duplicated (if the system prevents duplicates)

### File Size Limitations
- No specific file size limit for CSV files
- However, very large files (1000+ questions) may take longer to process
- Consider breaking large uploads into smaller batches for better performance

## Support

If you encounter issues with the CSV upload feature:

1. Check the validation errors shown in the upload modal
2. Review the browser console for detailed error messages
3. Verify your CSV format matches the requirements exactly
4. Try uploading a smaller sample first to test the format

## Example Files

A sample CSV file (`sample_mcq_questions.csv`) is included in the project root for reference. 