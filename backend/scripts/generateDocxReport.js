const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');

const mdPath = path.join(__dirname, '../../docs/PROJECT_REPORT.md');
const docxPath = path.join(__dirname, '../../docs/PROJECT_REPORT.docx');

const rawText = fs.readFileSync(mdPath, 'utf8');

const lines = rawText.split('\n');
const children = [];

// Title Header
children.push(
  new Paragraph({
    text: 'ACADEMIC PROJECT REPORT',
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 }
  }),
  new Paragraph({
    text: 'CAMPUS EVENT REGISTRATION AND MANAGEMENT SYSTEM',
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 }
  })
);

let inCodeBlock = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  if (line.startsWith('```')) {
    inCodeBlock = !inCodeBlock;
    continue;
  }

  if (inCodeBlock) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: lines[i],
            font: 'Courier New',
            size: 20
          })
        ],
        spacing: { after: 100 }
      })
    );
    continue;
  }

  if (!line || line === '---') {
    continue;
  }

  if (line.startsWith('# ')) {
    // Title already handled
    continue;
  } else if (line.startsWith('## ')) {
    children.push(
      new Paragraph({
        text: line.replace('## ', ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 }
      })
    );
  } else if (line.startsWith('### ')) {
    children.push(
      new Paragraph({
        text: line.replace('### ', ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 250, after: 120 }
      })
    );
  } else if (line.startsWith('#### ')) {
    children.push(
      new Paragraph({
        text: line.replace('#### ', ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 }
      })
    );
  } else if (line.startsWith('- ') || line.startsWith('* ')) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '• ' + line.substring(2).replace(/\*\*/g, ''),
            size: 22
          })
        ],
        spacing: { after: 100 }
      })
    );
  } else if (line.startsWith('|')) {
    // Simple table text rendering
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line.replace(/\|/g, '  |  '),
            font: 'Courier New',
            size: 18
          })
        ],
        spacing: { after: 60 }
      })
    );
  } else {
    // Normal paragraph
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line.replace(/\*\*/g, ''),
            size: 22
          })
        ],
        spacing: { after: 150 }
      })
    );
  }
}

const doc = new Document({
  sections: [
    {
      properties: {},
      children: children
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxPath, buffer);
  console.log(`[DOCX Generator] Successfully compiled editable project report to: ${docxPath}`);
});
