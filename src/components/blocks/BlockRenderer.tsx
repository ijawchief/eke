"use client";

import { Block } from "@/types";
import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

type D = Record<string, unknown>;
const str = (v: unknown) => (v as string) ?? "";
const arr = <T,>(v: unknown) => (v as T[]) ?? [];

function HeroBlock({ data }: { data: D }) {
  return (
    <div className="py-4 px-1">
      {!!data.badge && (
        <span className="inline-block bg-pink-50 text-pink-600 text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
          {str(data.badge)}
        </span>
      )}
      <h2 className="text-xl font-bold leading-snug text-gray-900 mb-2">
        {str(data.headline)}
      </h2>
      {!!data.subheadline && (
        <p className="text-sm text-gray-500 leading-relaxed">
          {str(data.subheadline)}
        </p>
      )}
    </div>
  );
}

function TextBlock({ data }: { data: D }) {
  return (
    <div className="py-3 px-1">
      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{str(data.content)}</p>
    </div>
  );
}

function ImageBlock({ data }: { data: D }) {
  return (
    <div className="py-4 px-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={str(data.url)}
        alt={str(data.alt ?? "")}
        className="w-full rounded-2xl object-cover shadow-sm"
      />
      {!!data.caption && (
        <p className="text-center text-xs text-gray-400 mt-2 italic">{str(data.caption)}</p>
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
      <div className="py-3 px-1">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-1">
      <video controls className="w-full rounded-2xl shadow-sm">
        <source src={url} />
      </video>
    </div>
  );
}

function TestimonialBlock({ data }: { data: D }) {
  return (
    <div className="py-3 px-1">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed italic mb-4">&ldquo;{str(data.quote)}&rdquo;</p>
        <div className="flex items-center gap-3">
          {!!data.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={str(data.avatar)} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-bold">
              {str(data.name).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-sm text-gray-900">{str(data.name)}</p>
            {!!data.title && <p className="text-xs text-gray-400">{str(data.title)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQBlock({ data }: { data: D }) {
  const items = arr<{ q: string; a: string }>(data.items);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="py-4 px-1">
      {!!data.heading && (
        <h2 className="text-base font-bold text-gray-900 mb-3">{str(data.heading)}</h2>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border transition-all ${open === i ? "border-pink-200 bg-pink-50" : "border-gray-100 bg-white"} overflow-hidden`}
          >
            <button
              className="w-full text-left flex justify-between items-center px-4 py-3 font-semibold text-sm text-gray-800 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{item.q}</span>
              <ChevronDown
                size={15}
                className={`flex-shrink-0 text-gray-400 transition-transform ${open === i ? "rotate-180 text-pink-500" : ""}`}
              />
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-gray-600 text-xs leading-relaxed border-t border-pink-100 pt-3">
                {item.a}
              </div>
            )}
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
  const units = [["Days", d], ["Hours", h], ["Mins", m], ["Secs", s]] as const;

  return (
    <div className="py-3 px-1">
      <div className="bg-indigo-50 border border-pink-100 rounded-2xl p-5 text-center">
        {!!data.label && (
          <p className="text-pink-500 text-xs font-semibold uppercase tracking-widest mb-3">{str(data.label)}</p>
        )}
        <div className="flex justify-center gap-2">
          {units.map(([unit, val]) => (
            <div key={unit} className="bg-white rounded-xl px-3 py-2 min-w-[56px] shadow-sm">
              <div className="text-2xl font-extrabold text-pink-600 tabular-nums">{String(val).padStart(2, "0")}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-wide">{unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BulletListBlock({ data }: { data: D }) {
  const items = arr<string>(data.items);

  return (
    <div className="py-3 px-1">
      {!!data.heading && (
        <p className="text-sm font-bold text-gray-800 mb-2">{str(data.heading)}</p>
      )}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-gray-400 text-sm mt-0.5">•</span>
            <span className="text-gray-600 text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DividerBlock() {
  return (
    <div className="py-2 px-1">
      <div className="border-t border-gray-100" />
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
    case "divider": return <DividerBlock />;
    default: return null;
  }
}
