import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { CustomAudioBlock } from "@/pages-contents/notes/components/custom-audio-block";

// Create custom audio block spec with proper configuration
export const CustomReactAudioBlock = createReactBlockSpec(
  {
    type: "audio",
    propSchema: {
      ...defaultProps,
      name: {
        default: "",
      },
      url: {
        default: "",
      },
      caption: {
        default: "",
      },
      showPreview: {
        default: true,
      },
      previewWidth: {
        default: 512,
      },
    },
    content: "none",
  },
  {
    render: (props) => (
      <CustomAudioBlock block={props.block} editor={props.editor} />
    ),
  }
);
