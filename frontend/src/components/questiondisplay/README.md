# Question Display Components

This directory contains reusable components for displaying different types of questions in the Test Vista platform.

## Components Overview

1. **QuestionDisplay**: Main component that handles all question types
2. **McqOptionsDisplay**: Specialized component for displaying Multiple Choice Questions (MCQ) options
3. **MatchPairsDisplay**: Specialized component for displaying Match the Pairs type questions

## Usage

### QuestionDisplay Component

This is the main component to use in most cases, as it automatically handles different question types.

```vue
<QuestionDisplay
  :question="question.question"
  :questionId="question.id"
  :questionNumber="index + 1" 
  :questionType="question.type"
  :topics="question.topics"
  :options="question.options"
  :correctOptionIndex="question.correctOptionIndex"
  :lhs="question.lhs"
  :rhs="question.rhs"
  :correctAnswer="question.correctAnswer"
  :imageUrl="question.imageUrl"
  :optionImages="question.optionImages"
  :lhsImages="question.lhsImages"
  :rhsImages="question.rhsImages"
  :isPreviousExam="question.isPreviousExam"
  :showFooter="true"
  :highlightCorrect="true"
/>
```

#### Props

| Prop                  | Type                      | Default   | Description                                       |
|-----------------------|---------------------------|-----------|---------------------------------------------------|
| question              | string                    | (required)| The question text                                 |
| questionId            | number                    | -         | Unique ID for the question                        |
| questionNumber        | number                    | -         | Number to display before the question (e.g., Q1)  |
| questionType          | string                    | -         | Type of question (MCQ, Match the Pairs, etc.)     |
| topics                | Topic[]                   | -         | Array of topics associated with the question      |
| options               | string[]                  | -         | Array of MCQ options                              |
| correctOptionIndex    | number                    | -         | Index of the correct MCQ option                   |
| lhs                   | string[]                  | -         | Left-hand side items for Match the Pairs          |
| rhs                   | string[]                  | -         | Right-hand side items for Match the Pairs         |
| correctAnswer         | string                    | -         | Correct answer for Fill in the Blanks             |
| imageUrl              | string \| null            | -         | URL of the question image                         |
| optionImages          | string[]                  | -         | Array of image URLs for MCQ options               |
| lhsImages             | string[]                  | -         | Array of image URLs for LHS items                 |
| rhsImages             | string[]                  | -         | Array of image URLs for RHS items                 |
| isPreviousExam        | boolean                   | false     | Whether this is a board exam question             |
| showFooter            | boolean                   | true      | Whether to show the footer with topics & type     |
| highlightCorrect      | boolean                   | true      | Whether to highlight the correct option           |
| showPreviewIndicator  | boolean                   | false     | Whether to show an indicator on images            |
| showDebugInfo         | boolean                   | false     | Whether to show debug information                 |
| optionLayout          | 'grid' \| 'list'          | 'grid'    | Layout for displaying options                     |
| questionTextMaxLength | number                    | 200       | Maximum length before truncating question         |
| answerTextMaxLength   | number                    | 200       | Maximum length before truncating answer           |
| optionTextMaxLength   | number                    | 80        | Maximum length before truncating options          |

### McqOptionsDisplay Component

Use this component directly if you need more control over MCQ options display.

```vue
<McqOptionsDisplay
  :options="question.options"
  :correctOptionIndex="question.correctOptionIndex"
  :questionId="question.id"
  :optionImages="question.optionImages"
  :highlightCorrect="true"
  layout="grid"
/>
```

#### Props

| Prop                | Type                 | Default | Description                                    |
|---------------------|----------------------|---------|------------------------------------------------|
| options             | string[]             | []      | Array of MCQ options                           |
| correctOptionIndex  | number               | -       | Index of the correct option                    |
| questionId          | number               | -       | Unique ID for the question                     |
| optionImages        | string[] \| null     | -       | Array of image URLs for options                |
| highlightCorrect    | boolean              | true    | Whether to highlight the correct option        |
| layout              | 'grid' \| 'list'     | 'grid'  | Layout style (grid or list)                    |
| showPreviewIndicator| boolean              | false   | Whether to show a visual indicator for images  |
| maxTextLength       | number               | 80      | Maximum text length before truncation          |

### MatchPairsDisplay Component

Use this component directly for Match the Pairs type questions.

```vue
<MatchPairsDisplay
  :leftItems="question.lhs"
  :rightItems="question.rhs"
  :questionId="question.id"
  :leftImages="question.lhsImages"
  :rightImages="question.rhsImages"
/>
```

#### Props

| Prop                | Type                 | Default | Description                                    |
|---------------------|----------------------|---------|------------------------------------------------|
| leftItems           | string[]             | []      | Array of left side items                       |
| rightItems          | string[]             | []      | Array of right side items                      |
| questionId          | number               | -       | Unique ID for the question                     |
| leftImages          | string[] \| null     | -       | Array of image URLs for left items             |
| rightImages         | string[] \| null     | -       | Array of image URLs for right items            |
| showDebugInfo       | boolean              | false   | Whether to show debugging information          |
| showPreviewIndicator| boolean              | false   | Whether to show a visual indicator for images  |
| maxTextLength       | number               | 80      | Maximum text length before truncation          |

## Example Implementation

Here's how to implement the QuestionDisplay component in your page:

```vue
<template>
  <div class="container">
    <div v-for="(question, index) in questions" :key="question.id" class="card mb-3">
      <div class="card-body">
        <QuestionDisplay
          :question="question.question"
          :questionId="question.id"
          :questionNumber="index + 1"
          :questionType="question.type"
          :topics="question.topics"
          :options="question.options"
          :correctOptionIndex="question.correctOptionIndex"
          :lhs="question.lhs"
          :rhs="question.rhs"
          :correctAnswer="question.correctAnswer"
          :imageUrl="question.imageUrl"
          :optionImages="question.optionImages"
          :isPreviousExam="question.isPreviousExam"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuestionDisplay from '@/components/questiondisplay/QuestionDisplay.vue';

// Your component logic
</script>
```

## Updating the Components

When making changes to the display logic or styling, update only these components rather than modifying display code in individual pages. This ensures consistent appearance and behavior across the application. 