import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MediaBlock } from "../MediaBlock";

describe("MediaBlock", () => {
  it("renders nothing for empty media", () => {
    const { container } = render(<MediaBlock media={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an <img> for image type with alt fallback", () => {
    render(
      <MediaBlock
        media={[
          { type: "image", src: "/foo.png", caption: "Architecture overview" },
        ]}
      />,
    );
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("/foo.png");
    expect(screen.getByText("Architecture overview")).toBeInTheDocument();
  });

  it("renders a <video> with controls for video type", () => {
    const { container } = render(
      <MediaBlock
        media={[
          { type: "video", src: "/clip.mp4", caption: "Demo clip" },
        ]}
      />,
    );
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("controls")).not.toBeNull();
    expect(screen.getByText("Demo clip")).toBeInTheDocument();
  });

  it("renders a privacy-friendly YouTube embed from a full URL", () => {
    const { container } = render(
      <MediaBlock
        media={[
          {
            type: "youtube",
            src: "https://www.youtube.com/watch?v=Mzx00MGOyAY",
            caption: "Playwright intro",
          },
        ]}
      />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain("youtube-nocookie.com/embed/Mzx00MGOyAY");
  });

  it("renders a YouTube embed from a short youtu.be URL", () => {
    const { container } = render(
      <MediaBlock
        media={[{ type: "youtube", src: "https://youtu.be/dQw4w9WgXcQ" }]}
      />,
    );
    expect(container.querySelector("iframe")?.src).toContain("dQw4w9WgXcQ");
  });

  it("accepts a raw 11-character YouTube id", () => {
    const { container } = render(
      <MediaBlock media={[{ type: "youtube", src: "abcdefghijk" }]} />,
    );
    expect(container.querySelector("iframe")?.src).toContain("abcdefghijk");
  });

  it("ignores malformed YouTube urls", () => {
    const { container } = render(
      <MediaBlock media={[{ type: "youtube", src: "not a url" }]} />,
    );
    expect(container.querySelector("iframe")).toBeNull();
  });
});
