import { RichEditor } from "@/components/pdp-rich-editor-2";

export default function CreateBlogStepTwo({ contentDoc, onDocChange, onHtmlChange }) {
  return (
    <div className="step-two">
      <RichEditor
        value={contentDoc}
        placeholder="Place your contents here. All formatting can be done from here too!"
        className="cms-rich-editor"
        showFooter
        onChange={onDocChange}
        onHTMLChange={onHtmlChange}
      />
    </div>
  );
}
