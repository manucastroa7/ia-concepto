import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

export interface StoryVideoOptions {
  videoUrl: string;
  hookText: string;
  overlayText: string;
  ctaText: string;
}

export class StoryVideoService {
  private ffmpegPath = process.env.FFMPEG_PATH || "C:\\ffmpeg\\bin\\ffmpeg.exe";
  private fontPath = process.env.FFMPEG_FONT_PATH || "C\\:/Windows/Fonts/arialbd.ttf";

  private sanitizeDrawtext(value: string) {
    return (value || "")
      .replace(/\\/g, "\\\\")
      .replace(/:/g, "\\:")
      .replace(/'/g, "\\'")
      .replace(/,/g, "\\,")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/\n/g, " ");
  }

  private runFfmpeg(args: string[]) {
    return new Promise<void>((resolve, reject) => {
      const proc = spawn(this.ffmpegPath, args, { windowsHide: true });
      let stderr = "";

      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      proc.on("error", (error) => reject(error));
      proc.on("close", (code) => {
        if (code === 0) return resolve();
        reject(new Error(stderr || `ffmpeg exited with code ${code}`));
      });
    });
  }

  private async downloadVideo(url: string, targetPath: string) {
    const response = await axios.get(url, { responseType: "stream" });
    await new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(targetPath);
      response.data.pipe(writer);
      writer.on("finish", () => resolve());
      writer.on("error", reject);
    });
  }

  async generateStoryVideo(options: StoryVideoOptions): Promise<Buffer> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "story-video-"));
    const inputPath = path.join(tmpDir, "input.mp4");
    const outputPath = path.join(tmpDir, "output.mp4");

    try {
      await this.downloadVideo(options.videoUrl, inputPath);

      const hook = this.sanitizeDrawtext(options.hookText);
      const overlay = this.sanitizeDrawtext(options.overlayText);
      const cta = this.sanitizeDrawtext(options.ctaText);

      const filter = [
        "scale=1080:1920:force_original_aspect_ratio=increase",
        "crop=1080:1920",
        "format=yuv420p",
        "drawbox=x=0:y=0:w=iw:h=ih:color=black@0.18:t=fill",
        `drawtext=fontfile='${this.fontPath}':text='${hook}':fontcolor=white:fontsize=72:line_spacing=8:borderw=3:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.16:enable='between(t,0,3.8)'`,
        `drawtext=fontfile='${this.fontPath}':text='${overlay}':fontcolor=white:fontsize=64:line_spacing=8:borderw=3:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.72:enable='between(t,3.8,7.5)'`,
        `drawtext=fontfile='${this.fontPath}':text='${cta}':fontcolor=white:fontsize=58:line_spacing=8:borderw=3:bordercolor=black@0.35:x=(w-text_w)/2:y=h*0.85:enable='between(t,7.5,11.5)'`
      ].join(",");

      await this.runFfmpeg([
        "-y",
        "-stream_loop", "-1",
        "-i", inputPath,
        "-t", "12",
        "-vf", filter,
        "-an",
        "-r", "30",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "22",
        "-movflags", "+faststart",
        outputPath,
      ]);

      return fs.readFileSync(outputPath);
    } finally {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  }
}
