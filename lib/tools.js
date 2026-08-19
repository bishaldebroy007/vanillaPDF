import { Combine, Scissors, Image as ImageIcon, Zap } from "lucide-react";

export const tools = [
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one master document.",
    icon: Combine,
    color: "bg-red-500",
    kanji: "結合",
    actionLabel: "Combine Files",
    acceptMultiple: true,
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract pages or split your PDF into separate files.",
    icon: Scissors,
    color: "bg-zinc-800",
    kanji: "分割",
    actionLabel: "Split Now",
    acceptMultiple: false,
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Convert each page of your PDF into high-quality images.",
    icon: ImageIcon,
    color: "bg-red-700",
    kanji: "画像",
    actionLabel: "Convert to Image",
    acceptMultiple: false,
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Optimize your PDF by stripping metadata and reducing overhead.",
    icon: Zap,
    color: "bg-zinc-900",
    kanji: "圧縮",
    actionLabel: "Optimize Now",
    acceptMultiple: false,
  },
];

export const toolsInfo = Object.fromEntries(
  tools.map(({ id, name, description, actionLabel, acceptMultiple, kanji }) => [
    id,
    { name, description, actionLabel, acceptMultiple, kanji },
  ])
);

export const toolIds = tools.map((t) => t.id);
