"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";

export default function UploadWidget() {
  const [show, setShow] = useState(false);

  return (
    <div>
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="w-full rounded-xl border-2 border-dashed border-amber-300 py-4 text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-colors text-sm font-medium"
        >
          + 上传图片到日历
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow border border-amber-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-medium text-amber-900">上传图片</h2>
            <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600 text-sm">
              收起
            </button>
          </div>
          <ImageUpload />
        </div>
      )}
    </div>
  );
}
