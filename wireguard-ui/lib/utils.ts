import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Server from "@/models/server"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isValidIpAddress = (ip: string) => {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([12]?[0-9]|3[0-2])$/
  return regex.test(ip)
}

export const getNextIpAddress = (server: Server, currentIp: string) => {
  const [ip, subnetMask] = server.ip_address.split('/')
  const baseIpInt = ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet), 0)
  const maskBits = parseInt(subnetMask, 10)

  const rangeStart = baseIpInt & (~0 << (32 - maskBits));
  const rangeEnd = rangeStart | (~0 >>> maskBits);

  const currentIpInt = currentIp.split('.').reduce((int, octet) => (int << 8) + parseInt(octet), 0);

  const nextIpInt = currentIpInt + 1;
  if (nextIpInt <= rangeEnd) {
    return [24, 16, 8, 0].map(shift => (nextIpInt >> shift) & 255).join('.');
  } else {
    return null;
  }
}
