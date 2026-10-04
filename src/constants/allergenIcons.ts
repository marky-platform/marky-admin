import celery from "../assets/icons/allergens/celery.svg";
import crustaceans from "../assets/icons/allergens/crustaceans.svg";
import egg from "../assets/icons/allergens/egg.svg";
import fish from "../assets/icons/allergens/fish.svg";
import lupin from "../assets/icons/allergens/lupin.png";
import milk from "../assets/icons/allergens/milk.svg";
import mollusks from "../assets/icons/allergens/mollusks.svg";
import mustard from "../assets/icons/allergens/mustard.svg";
import peanut from "../assets/icons/allergens/peanut.png";
import sesame from "../assets/icons/allergens/sesame.svg";
import soy from "../assets/icons/allergens/soy.svg";
import sulfites from "../assets/icons/allergens/sulfites.png";
import treeNuts from "../assets/icons/allergens/tree_nuts.svg";

// Íconos exportados de Figma (modal de alérgenos, nodo 6094:23843). El diseño
// no incluye ícono para "Cereales con gluten" (`gluten_cereals`): la UI usa un
// ícono neutro de respaldo.
export const ALLERGEN_ICONS: Record<string, string> = {
  milk,
  egg,
  tree_nuts: treeNuts,
  peanut,
  soy,
  sesame,
  fish,
  crustaceans,
  mollusks,
  mustard,
  celery,
  lupin,
  sulfites,
};
