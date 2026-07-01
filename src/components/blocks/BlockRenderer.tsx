"use client";

import { Block } from "@/types";
import { useState, useEffect } from "react";

type D = Record<string, unknown>;
const str = (v: unknown) => v as string;
const arr = <T,>(v: unknown) => v as T[];

function HeroBlock({ data }: { data: D }) {
  return (
    <div className="text-center py-16 px-4">
      {!!data.badge && (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          {str(data.badge)}
        </span>
      )}
      <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
        {str(data.headline)}
      </h1>
      {!!data.subheadline && (
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{str(data.subheadline)}</p>
      )}
    </div>
  );
}

function TextBlock({ data }: { data: D }) {
  return (
    <div className="prose prose-lg max-w-2xl mx-auto px-4 py-6">
      <p className="whitespace-pre-line">{str(data.content)}</p>
    </div>
  );
}

function ImageBlock({ data }: { data: D }) {
  return (
    <div className="py-4 px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={str(data.url)}
        alt={str(data.alt ?? "")}
        className="mx-auto rounded-lg max-w-full"
      />
      {!!data.caption && (
        <p className="text-center text-sm text-gray-500 mt-2">{str(data.caption)}</p>
      )}
    </div>
  );
}

function VideoBlock({ data }: { data: D }) {
  const url = str(data.url);
  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo = url.includes("vimeo.com");

  let embedUrl = url;
  if (isYoutube) {
    const id = url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  } else if (isVimeo) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    embedUrl = `https://player.vimeo.com/video/${id}`;
  }

  if (isYoutube || isVimeo) {
    return (
      <div className="py-4 px-4">
        <div className="relative aspect-video max-w-3xl mx-auto">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-4">
      <video controls className="mx-auto rounded-lg max-w-full">
        <source src={url} />
      </video>
    </div>
  );
}

function TestimonialBlock({ data }: { data: D }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 mx-4 my-4 max-w-2xl mx-auto">
      <p className="text-lg italic text-gray-700 mb-4">&ldquo;{str(data.quote)}&rdquo;</p>
      <div className="flex items-center gap-3">
        {!!data.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={str(data.avatar)}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-sm">{str(data.name)}</p>
          {!!data.title && <p className="text-xs text-gray-500">{str(data.title)}</p>}
        </div>
      </div>
    </div>
  );
}

function FAQBlock({ data }: { data: D }) {
  const items = arr<{ q: string; a: string }>(data.items);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {!!data.heading && <h2 className="text-2xl font-bold mb-6">{str(data.heading)}</h2>}
      <div className="divide-y">
        {items.map((item, i) => (
          <div key={i} className="py-4">
            <button
              className="w-full text-left flex justify-between items-center font-medium"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
              <span className="ml-4 text-gray-400">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="mt-3 text-gray-600">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CountdownBlock({ data }: { data: D }) {
  const target = new Date(str(data.deadline)).getTime();
  const [remaining, setRemaining] = useState(Math.max(0, target - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);

  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="text-center py-6 px-4">
      {!!data.label && <p className="text-sm text-gray-500 mb-3">{str(data.label)}</p>}
      <div className="flex justify-center gap-4">
        {(["Days", "Hrs", "Min", "Sec"] as const).map((unit, idx) => {
          const val = [d, h, m, s][idx];
          return (
            <div key={unit} className="bg-gray-900 text-white rounded-lg p-3 min-w-16 text-center">
              <div className="text-3xl font-bold tabular-nums">{String(val).padStart(2, "0")}</div>
              <div className="text-xs mt-1 text-gray-400">{unit}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BulletListBlock({ data }: { data: D }) {
  const items = arr<string>(data.items);
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {!!data.heading && <h2 className="text-2xl font-bold mb-4">{str(data.heading)}</h2>}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DividerBlock({ data }: { data: D }) {
  return (
    <div className="px-4 py-2">
      <hr className={`border-t ${data.style === "thick" ? "border-2" : ""} border-gray-200`} />
    </div>
  );
}

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "hero": return <HeroBlock data={block.data} />;
    case "text": return <TextBlock data={block.data} />;
    case "image": return <ImageBlock data={block.data} />;
    case "video": return <VideoBlock data={block.data} />;
    case "testimonial": return <TestimonialBlock data={block.data} />;
    case "faq": return <FAQBlock data={block.data} />;
    case "countdown": return <CountdownBlock data={block.data} />;
    case "bullet_list": return <BulletListBlock data={block.data} />;
    case "divider": return <DividerBlock data={block.data} />;
    default: return null;
  }
}
