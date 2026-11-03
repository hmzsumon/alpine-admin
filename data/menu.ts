/* ────────── imports ────────── */
import { AppData, MenuItem, Station } from "@/types";
// Each purchasable size is a distinct SKU; unknown prices stay unavailable until confirmed.
const groups: [string, Station, string][] = [
  [
    "Breakfast",
    "Main Kitchen",
    "Mug Dal:30|Bhaji:40|Dal Bhaji Mix:50|Mutton Koligi:120|Mutton Paya:120|Chicken Soup:100|Chicken Khichuri:100|Mutton Khichuri:140|Egg Omelette:30|Boil Egg:20|L. Chicken Soup:100|L. Vegetable Soup:100",
  ],
  [
    "Paratha",
    "Main Kitchen",
    "Normal Paratha:25|Special Paratha:50|Keema Paratha:220|Chicken Masala Paratha:200",
  ],
  [
    "Naan",
    "BBQ",
    "Normal Naan:20|Special Naan:50|Garlic Naan:90|Keema Naan:220|Chicken Masala Naan:200",
  ],
  [
    "Rice & Sides",
    "Main Kitchen",
    "Plain Rice (Chini Gura):50|Daal:20|Korola Bhaji:30|Fish Bhorta:40|Potol Bhorta:40|Dherosh Bhaji:40|Mix Salad:80|Vegetable:50|Chicken Vegetable:60|Achar:",
  ],
  [
    "Curry & Bhuna",
    "Main Kitchen",
    "Shutki Bhuna:140/280|Chicken Jhal Fry:160/320|Chicken Roast:140|Mutton / Lamb Curry:260/520|Beef Bhuna:220/440|Beef Kala Bhuna:240/480|Mogoj Bhuna:120/240",
  ],
  [
    "Fish",
    "Main Kitchen",
    "Hilsa Fish:|Rui Fish:|Pabda Fish:|Bowal Fish:|Prawn Fish:|Aair Fish:|Baim Fish:|Rupchada Fish:|Prawn Dopiaza:",
  ],
  [
    "Biriyani",
    "Main Kitchen",
    "Chicken Biriyani:170|Kacchi Biriyani:230|Mutton Biriyani:240|Beef Biriyani:260|Shahi Biriyani:100|Biriyani Extra Rice:|Biriyani Extra Chap:80",
  ],
  ["Halim", "Main Kitchen", "Halim:120|Halim Patil:350"],
  [
    "Grill & Kebab",
    "BBQ",
    "Fish Grill:|French Fry (1:1):150|Chicken Grill Full:440|Chicken Grill Half:220|Chicken Tandoori:130|Chicken Chaap:170|Sheekh Kebab (Beef):160/320|Boti Kebab (Mutton):170/340",
  ],
  [
    "Shawarma",
    "BBQ",
    "Beef Shawarma:200|Chicken Shawarma:180|Tuna Fish Shawarma:190",
  ],
  [
    "Pizza",
    "BBQ",
    "Chicken Pizza:630/750/830|Barcelona Pizza:750/850/950|Tuna Fish Pizza:700/800/900|Sausage Pizza:600/730/850|Margherita Pizza:500/600/700|Vegetable Pizza:600/700/900",
  ],
  ["Pasta", "BBQ", "Pasta Basta:300|Beef Pasta:320|Chicken Naga Pasta:330"],
  [
    "Tea & Coffee",
    "Drinks",
    "Hot Coffee:110|Hot Chocolate:130|Cold Coffee:120|Chocolate Cold Coffee:130|Tea:25|Special Tea:50|Molasses Tea Small:30|Molasses Tea Special:40",
  ],
  [
    "Lassi",
    "Drinks",
    "Sweet Lassi:110|Chocolate Lassi:130|Strawberry Lassi:130|Mango Lassi:140|Alpine Chef Special Lassi:150|Salt Lassi:130|Special Lacchi:110",
  ],
  [
    "Faluda & Dessert",
    "Drinks",
    "Alpine Classic Special Faluda:200|Normal Faluda:140|Special Faluda:160|Normal Family Faluda:300|Special Family Faluda:|Pudding:60|Doi:40|Firni:35",
  ],
  [
    "Shakes",
    "Drinks",
    "Vanilla Shake:160|Mango Shake:160|Strawberry Shake:160|Chocolate Shake:160|Oreo Shake:180|Kitkat Shake:190",
  ],
  [
    "Mocktails",
    "Drinks",
    "Virgin Mint:140|Blue Ocean Cooler:180|Sunrise Light Mojito:170|Rainbow Paradise:190|Kiwi Mojito:170|Kiwi Fantasy:160|Blueberry Mojito Spritzer:170|Blueberry Fantasy:180",
  ],
  [
    "Juice & Drinks",
    "Drinks",
    "Orange Juice:130|Apple Juice:120|Mixed Fruit Juice:180|Mango Juice:120|Seasonal Fruit Juice:|Ice Lemon Tea:130|Ice Orange Tea:150|Mint Lemonade:100|Coke / Sprite / Pepsi:|Burhani Glass:45|Burhani 1 Litre:200",
  ],
];
export const menu: MenuItem[] = groups.flatMap(([category, station, text]) =>
  text.split("|").flatMap((entry) => {
    // Item names can contain colons, e.g. French Fry (1:1).
    const separator = entry.lastIndexOf(":");
    const name = entry.slice(0, separator);
    const prices = entry.slice(separator + 1);
    const sizes = prices ? prices.split("/") : [""];
    return sizes.map((p, i) => ({
      id: `${category}-${name}-${i}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name:
        name +
        (sizes.length === 3
          ? ` (${[8, 10, 12][i]} inch)`
          : sizes.length === 2
          ? ` (Portion ${i + 1})`
          : ""),
      category,
      station,
      price: p ? Number(p) : null,
      active: Boolean(p) && sizes.length !== 2,
      note:
        sizes.length === 2
          ? "Confirm portion names before enabling"
          : name === "Special Family Faluda"
          ? "Confirm price: menu lists both 400 and 420"
          : undefined,
    }));
  })
);
export function initialData(): AppData {
  return {
    menu,
    orders: [],
    expenses: [],
    printers: [
      {
        id: "main",
        name: "Main Kitchen",
        floor: "Ground floor",
        station: "Main Kitchen",
        ip: "",
        enabled: false,
      },
      {
        id: "bbq",
        name: "BBQ Kitchen",
        floor: "Second floor",
        station: "BBQ",
        ip: "",
        enabled: false,
      },
      {
        id: "drinks",
        name: "Drinks & Dessert",
        floor: "Second floor",
        station: "Drinks",
        ip: "",
        enabled: false,
      },
      {
        id: "cash",
        name: "Cash Counter",
        floor: "Cash counter",
        station: "Cash Counter",
        ip: "",
        enabled: false,
      },
    ],
  };
}
