"use client";

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { Car, CarStatus } from "@/lib/types";

interface CarCardProps {
  car: Car;
  onStatusChange: (id: string, status: CarStatus) => void;
}

export default function CarCard({ car, onStatusChange }: CarCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {car.mainPhotoUrl ? (
          <img
            src={car.mainPhotoUrl}
            alt={car.carTitle ?? "Car"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={car.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
            {car.carTitle ?? `${car.make} ${car.model}`}
          </h3>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {car.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">SAR</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>{car.year}</span>
          {car.km > 0 && <span>{car.km.toLocaleString()} km</span>}
          {car.conditionType && <span>{car.conditionType}</span>}
          {car.color && <span>{car.color}</span>}
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <select
            value={car.status}
            onChange={(e) => onStatusChange(car.id, e.target.value as CarStatus)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="pending">Pending Review</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>
          <Link
            href={`/cars/${car.id}/edit`}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
