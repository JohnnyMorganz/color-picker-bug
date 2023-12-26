// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const smallText = "aaaa";
const longText = `type Color3 = {
    fromHSV: (hue: number, saturation: number, value: number) -> Color3,
	fromRGB: (red: number?, green: number?, blue: number?) -> Color3,
    toHSV: (color: Color3) -> (number, number, number),
	new: (red: number?, green: number?, blue: number?) -> Color3,
	fromHex: (hex: string) -> Color3,
}
`;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("color-picker-bug activated");

  context.subscriptions.push(
    vscode.languages.registerHoverProvider("plaintext", {
      provideHover(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position);
        const word = document.getText(wordRange);

        if (word === "ShortColor") {
          return new vscode.Hover(
            new vscode.MarkdownString().appendCodeblock(smallText, "lua"),
            wordRange
          );
        } else if (word === "LongColor") {
          return new vscode.Hover(
            new vscode.MarkdownString().appendCodeblock(longText, "lua"),
            wordRange
          );
        } else {
          return null;
        }
      },
    })
  );

  context.subscriptions.push(
    vscode.languages.registerColorProvider("plaintext", {
      provideDocumentColors(document, token) {
        const text = document.getText();
        const shortColorRegex =
          /ShortColor.new\((\d+\.?\d*),\s*(\d+\.?\d*),\s*(\d+\.?\d*)\)/g;
        const longColorRegex =
          /LongColor.new\((\d+\.?\d*),\s*(\d+\.?\d*),\s*(\d+\.?\d*)\)/g;

        const results: vscode.ColorInformation[] = [];

        const handleMatch = (match: RegExpExecArray) => {
          const offset = match.index;
          const range = new vscode.Range(
            document.positionAt(offset),
            document.positionAt(offset + match[0].length)
          );
          const [r, g, b] = [
            Number(match[1]),
            Number(match[2]),
            Number(match[3]),
          ];

          results.push(
            new vscode.ColorInformation(range, new vscode.Color(r, g, b, 0))
          );
        };

        let match;
        while ((match = shortColorRegex.exec(text))) {
          handleMatch(match);
        }
        while ((match = longColorRegex.exec(text))) {
          handleMatch(match);
        }

        return results;
      },

      provideColorPresentations(color, context, token) {
        const word = context.document.getText(
          context.document.getWordRangeAtPosition(context.range.start)
        );

        return [
          new vscode.ColorPresentation(
            `${word}.new(${color.red}, ${color.green}, ${color.blue})`
          ),
        ];
      },
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
