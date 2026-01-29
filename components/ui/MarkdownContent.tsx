import { StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";

type MarkdownContentProps = {
  content: string;
  variant?: "default" | "interpretation";
};

// Remove source references like [1], [2], [3] etc.
function cleanSourceReferences(text: string): string {
  return text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
}

// Custom markdown styles for dream interpretation
const markdownStyles = StyleSheet.create({
  body: {
    color: colors.text,
    fontFamily: typography.families.body.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  heading1: {
    fontFamily: typography.families.heading.bold,
    fontSize: 20,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: 18,
    color: colors.text,
    marginTop: 14,
    marginBottom: 6,
  },
  heading3: {
    fontFamily: typography.families.body.semiBold,
    fontSize: 16,
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  strong: {
    fontFamily: typography.families.body.semiBold,
    fontWeight: "600",
    color: colors.primary,
  },
  em: {
    fontFamily: typography.families.body.regular,
    fontStyle: "italic",
    color: colors.textMuted,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    marginVertical: 4,
    flexDirection: "row",
  },
  bullet_list_icon: {
    color: colors.primary,
    marginRight: 8,
    fontSize: 8,
  },
  ordered_list_icon: {
    color: colors.primary,
    marginRight: 8,
    fontFamily: typography.families.body.semiBold,
  },
  blockquote: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  code_inline: {
    fontFamily: "monospace",
    backgroundColor: colors.surface,
    color: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
  },
  code_block: {
    fontFamily: "monospace",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 13,
  },
  fence: {
    fontFamily: "monospace",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 16,
  },
  // Table styles
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginVertical: 8,
  },
  thead: {
    backgroundColor: colors.surface,
  },
  th: {
    fontFamily: typography.families.body.semiBold,
    padding: 8,
  },
  td: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

// Interpretation-specific styles (more visual, with sections)
const interpretationStyles = StyleSheet.create({
  ...markdownStyles,
  body: {
    ...markdownStyles.body,
    fontSize: 15,
    lineHeight: 26,
  },
  strong: {
    ...markdownStyles.strong,
    fontSize: 15,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 14,
  },
});

export function MarkdownContent({
  content,
  variant = "default",
}: MarkdownContentProps) {
  const cleanedContent = cleanSourceReferences(content);
  const styles = variant === "interpretation" ? interpretationStyles : markdownStyles;

  return (
    <Markdown style={styles}>
      {cleanedContent}
    </Markdown>
  );
}

export default MarkdownContent;
