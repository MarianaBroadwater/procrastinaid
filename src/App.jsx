import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
var BG    = "#f5f2ee";
var SURF  = "#ede9e3";
var CARD  = "#faf8f5";
var BORDER= "#d6d0c8";
var TEXT  = "#2c2825";
var MUTED = "#8a8078";
var FAINT = "#e8e3dc";
var GREEN = "#5a8a6a";
var SAGE  = "#7ea58a";
var NAVY  = "#3a4f6e";
var AMBER = "#b87333";
var RED   = "#c0392b";
var CREAM = "#fdf9f3";
var WARM  = "#e8ddd0";

var MODEL = "claude-sonnet-4-20250514";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
var CSS = [
  "* { box-sizing: border-box; margin: 0; }",
  "body { margin: 0; background: #f5f2ee; font-family: Georgia, serif; }",
  "::-webkit-scrollbar { width: 4px; }",
  "::-webkit-scrollbar-track { background: #f5f2ee; }",
  "::-webkit-scrollbar-thumb { background: #d6d0c8; border-radius: 4px; }",
  "@keyframes spin { to { transform: rotate(360deg); } }",
  "@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }",
  "@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }",
  "@keyframes pop { from{transform:scale(0.95);opacity:0} to{transform:scale(1);opacity:1} }",
  "@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }",
].join(" ");

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
var T = {
  app:  { minHeight:"100vh", background:BG, color:TEXT, fontFamily:"Georgia, 'Palatino Linotype', serif", display:"flex", flexDirection:"column" },
  bar:  { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:52, borderBottom:"1px solid "+BORDER, background:CARD, position:"sticky", top:0, zIndex:100, flexShrink:0 },
  logo: { fontWeight:"700", fontSize:17, letterSpacing:"0.04em", color:TEXT },
  tabs: { display:"flex", background:FAINT, borderRadius:10, padding:3, gap:2 },
  tab:  function(a){ return { padding:"6px 11px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:a?"700":"500", background:a?CARD:"transparent", color:a?NAVY:MUTED, fontFamily:"inherit", transition:"all .15s", whiteSpace:"nowrap" }; },
  page: { maxWidth:720, margin:"0 auto", padding:"22px 16px 80px", width:"100%" },
  h1:   { fontSize:22, fontWeight:"700", color:TEXT, margin:"0 0 4px", lineHeight:1.3 },
  h2:   { fontSize:16, fontWeight:"700", color:TEXT, margin:"0 0 10px" },
  h3:   { fontSize:10, fontWeight:"700", color:MUTED, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.1em" },
  sub:  { color:MUTED, fontSize:13, lineHeight:1.7, margin:"0 0 18px" },
  card: { background:CARD, border:"1px solid "+BORDER, borderRadius:12, padding:"16px", marginBottom:12, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  warm: { background:WARM, border:"1px solid "+BORDER, borderRadius:12, padding:"16px", marginBottom:12 },
  flat: { background:SURF, border:"1px solid "+BORDER, borderRadius:9, padding:"12px", marginBottom:8 },
  btn:  function(bg,fg){ return { padding:"10px 20px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:"700", fontSize:13, background:bg||GREEN, color:fg||CREAM, fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6, transition:"opacity .15s" }; },
  bsm:  function(bg,fg){ return { padding:"5px 11px", borderRadius:6, border:"none", cursor:"pointer", fontWeight:"600", fontSize:11, background:bg||FAINT, color:fg||MUTED, fontFamily:"inherit" }; },
  out:  { padding:"8px 16px", borderRadius:8, cursor:"pointer", fontWeight:"600", fontSize:12, background:"transparent", color:MUTED, border:"1px solid "+BORDER, fontFamily:"inherit" },
  inp:  { width:"100%", padding:"9px 12px", borderRadius:8, background:CREAM, border:"1px solid "+BORDER, color:TEXT, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  lbl:  { fontSize:10, fontWeight:"700", color:MUTED, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:5 },
  row:  { display:"flex", gap:9, flexWrap:"wrap", alignItems:"center" },
  g2:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  g3:   { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 },
  badge:function(c){ return { display:"inline-block", padding:"2px 9px", borderRadius:20, background:c+"18", color:c, fontSize:11, fontWeight:"700", border:"1px solid "+c+"30" }; },
  div:  { borderTop:"1px solid "+BORDER, margin:"14px 0" },
};

// ─── SECTIONS ────────────────────────────────────────────────────────────────
var SECTIONS = [
  { id:"bb",   label:"Biology & Biochemistry",  short:"B/B",  emoji:"🧬", color:GREEN },
  { id:"cp",   label:"Chemistry & Physics",     short:"C/P",  emoji:"⚗️",  color:NAVY  },
  { id:"ps",   label:"Psych & Sociology",       short:"P/S",  emoji:"🧠", color:"#8a5c8a" },
  { id:"cars", label:"Critical Analysis (CARS)",short:"CARS", emoji:"📖", color:AMBER },
];

// ─── ALL 193 AAMC TOPICS ──────────────────────────────────────────────────────
var ALL_TOPICS = {
bb: [
  {id:"bb_0",  title:"Amino Acids",                              cat:"1A: Proteins & Enzymes"},
  {id:"bb_1",  title:"Protein Structure",                        cat:"1A: Proteins & Enzymes"},
  {id:"bb_2",  title:"Nonenzymatic Protein Function",            cat:"1A: Proteins & Enzymes"},
  {id:"bb_3",  title:"Enzyme Structure and Function",            cat:"1A: Proteins & Enzymes"},
  {id:"bb_4",  title:"Control of Enzyme Activity & Kinetics",    cat:"1A: Proteins & Enzymes"},
  {id:"bb_5",  title:"Nucleic Acid Structure",                   cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_6",  title:"DNA Double Helix & Watson-Crick Model",    cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_7",  title:"DNA Repair Mechanisms",                    cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_8",  title:"Genetic Code",                             cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_9",  title:"Transcription",                            cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_10", title:"Translation",                              cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_11", title:"Eukaryotic Chromosome Organization",       cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_12", title:"Gene Expression in Prokaryotes (Operons)", cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_13", title:"Gene Expression in Eukaryotes",           cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_14", title:"Recombinant DNA & Biotechnology",          cat:"1B: Genetics & Molecular Biology"},
  {id:"bb_15", title:"Evidence That DNA Is Genetic Material",    cat:"1C: Inheritance & Evolution"},
  {id:"bb_16", title:"Mendelian Genetics",                       cat:"1C: Inheritance & Evolution"},
  {id:"bb_17", title:"Chromosome Transmission & Inheritance",   cat:"1C: Inheritance & Evolution"},
  {id:"bb_18", title:"Genetic Diversity & Sexual Reproduction",  cat:"1C: Inheritance & Evolution"},
  {id:"bb_19", title:"Meiosis",                                  cat:"1C: Inheritance & Evolution"},
  {id:"bb_20", title:"Genetic Variability: Linkage & Recombination", cat:"1C: Inheritance & Evolution"},
  {id:"bb_21", title:"Analytical Methods in Genetics",          cat:"1C: Inheritance & Evolution"},
  {id:"bb_22", title:"Evolution & Natural Selection",            cat:"1C: Inheritance & Evolution"},
  {id:"bb_23", title:"Principles of Bioenergetics",              cat:"1D: Metabolism"},
  {id:"bb_24", title:"Energy Harvesting from Fuel Molecules",    cat:"1D: Metabolism"},
  {id:"bb_25", title:"Carbohydrates",                            cat:"1D: Metabolism"},
  {id:"bb_26", title:"Glycolysis & Gluconeogenesis",             cat:"1D: Metabolism"},
  {id:"bb_27", title:"Pentose Phosphate Pathway",                cat:"1D: Metabolism"},
  {id:"bb_28", title:"Metabolic Regulation",                     cat:"1D: Metabolism"},
  {id:"bb_29", title:"Citric Acid Cycle (Krebs Cycle)",          cat:"1D: Metabolism"},
  {id:"bb_30", title:"Fatty Acid & Protein Metabolism",          cat:"1D: Metabolism"},
  {id:"bb_31", title:"Oxidative Phosphorylation & ETC",          cat:"1D: Metabolism"},
  {id:"bb_32", title:"Hormonal Regulation of Metabolism",        cat:"1D: Metabolism"},
  {id:"bb_33", title:"Metabolic Integration",                    cat:"1D: Metabolism"},
  {id:"bb_34", title:"Overview: Biological & Biochemical Foundations", cat:"Overview"},
  {id:"bb_35", title:"Plasma Membrane Structure",                cat:"2A: Cell Biology"},
  {id:"bb_36", title:"Membrane Transport",                       cat:"2A: Cell Biology"},
  {id:"bb_37", title:"Internal Membranes & Cell Junctions",      cat:"2A: Cell Biology"},
  {id:"bb_38", title:"Membrane-Bound Organelles",                cat:"2A: Cell Biology"},
  {id:"bb_39", title:"Eukaryotic Cell Characteristics",          cat:"2A: Cell Biology"},
  {id:"bb_40", title:"Organelle Functions",                      cat:"2A: Cell Biology"},
  {id:"bb_41", title:"Nucleus & Nuclear Transport",              cat:"2A: Cell Biology"},
  {id:"bb_42", title:"Lysosomes & Vesicular Transport",          cat:"2A: Cell Biology"},
  {id:"bb_43", title:"Cytoskeleton",                             cat:"2A: Cell Biology"},
  {id:"bb_44", title:"Tissues & Cell Types",                     cat:"2A: Cell Biology"},
  {id:"bb_45", title:"Cellular Organization & Life",             cat:"2B: Prokaryotes & Viruses"},
  {id:"bb_46", title:"Cell Theory",                              cat:"2B: Prokaryotes & Viruses"},
  {id:"bb_47", title:"Prokaryotic Cell Structure",               cat:"2B: Prokaryotes & Viruses"},
  {id:"bb_48", title:"Prokaryotic Growth & Physiology",          cat:"2B: Prokaryotes & Viruses"},
  {id:"bb_49", title:"Prokaryotic Genetics",                     cat:"2B: Prokaryotes & Viruses"},
  {id:"bb_50", title:"Virus Structure",                          cat:"2B: Prokaryotes & Viruses"},
  {id:"bb_51", title:"Viral Life Cycle",                         cat:"2B: Prokaryotes & Viruses"},
  {id:"bb_52", title:"Mitosis & Cell Cycle",                     cat:"2C: Cell Division & Development"},
  {id:"bb_53", title:"Biosignaling & Cell Communication",        cat:"2C: Cell Division & Development"},
  {id:"bb_54", title:"Reproductive System (Cell Context)",       cat:"2C: Cell Division & Development"},
  {id:"bb_55", title:"Embryogenesis",                            cat:"2C: Cell Division & Development"},
  {id:"bb_56", title:"Mechanisms of Development",               cat:"2C: Cell Division & Development"},
  {id:"bb_57", title:"Overview: Living Systems",                 cat:"Overview"},
  {id:"bb_58", title:"Nervous System Structure & Function",      cat:"3A: Nervous & Endocrine"},
  {id:"bb_59", title:"Nerve Cell & Action Potential",            cat:"3A: Nervous & Endocrine"},
  {id:"bb_60", title:"Electrochemistry in Neuroscience",         cat:"3A: Nervous & Endocrine"},
  {id:"bb_61", title:"Nernst Equation",                          cat:"3A: Nervous & Endocrine"},
  {id:"bb_62", title:"Biosignaling: Receptors & Pathways",       cat:"3A: Nervous & Endocrine"},
  {id:"bb_63", title:"Lipids",                                   cat:"3A: Nervous & Endocrine"},
  {id:"bb_64", title:"Endocrine System: Hormones & Sources",     cat:"3A: Nervous & Endocrine"},
  {id:"bb_65", title:"Endocrine System: Hormone Action",         cat:"3A: Nervous & Endocrine"},
  {id:"bb_66", title:"Organ System Organization",                cat:"3B: Organ Systems"},
  {id:"bb_67", title:"Organ System Coordination",                cat:"3B: Organ Systems"},
  {id:"bb_68", title:"Respiratory System",                       cat:"3B: Organ Systems"},
  {id:"bb_69", title:"Circulatory System",                       cat:"3B: Organ Systems"},
  {id:"bb_70", title:"Lymphatic System",                         cat:"3B: Organ Systems"},
  {id:"bb_71", title:"Immune System",                            cat:"3B: Organ Systems"},
  {id:"bb_72", title:"Digestive System",                         cat:"3B: Organ Systems"},
  {id:"bb_73", title:"Excretory System & Kidneys",               cat:"3B: Organ Systems"},
  {id:"bb_74", title:"Reproductive System (Anatomy)",            cat:"3B: Organ Systems"},
  {id:"bb_75", title:"Muscle System",                            cat:"3B: Organ Systems"},
  {id:"bb_76", title:"Muscle Cell Physiology",                   cat:"3B: Organ Systems"},
  {id:"bb_77", title:"Skeletal System",                          cat:"3B: Organ Systems"},
  {id:"bb_78", title:"Skin (Integumentary System)",              cat:"3B: Organ Systems"},
],
cp: [
  {id:"cp_0",  title:"Translational Motion & Kinematics",        cat:"4A: Mechanics"},
  {id:"cp_1",  title:"Forces & Newton's Laws",                   cat:"4A: Mechanics"},
  {id:"cp_2",  title:"Equilibrium",                              cat:"4A: Mechanics"},
  {id:"cp_3",  title:"Work, Energy & Power",                     cat:"4A: Mechanics"},
  {id:"cp_4",  title:"Periodic Motion & Waves",                  cat:"4A: Mechanics"},
  {id:"cp_5",  title:"Fluids: Statics & Dynamics",               cat:"4B: Fluids & Gases"},
  {id:"cp_6",  title:"Circulatory System Physics",               cat:"4B: Fluids & Gases"},
  {id:"cp_7",  title:"Gas Phase & Ideal Gas Law",                cat:"4B: Fluids & Gases"},
  {id:"cp_8",  title:"Concentration Gradients & Membrane Potential", cat:"4C: Electrochemistry"},
  {id:"cp_9",  title:"Electrostatics",                           cat:"4C: Electrochemistry"},
  {id:"cp_10", title:"Circuits & Ohm's Law",                     cat:"4C: Electrochemistry"},
  {id:"cp_11", title:"Magnetism",                                cat:"4C: Electrochemistry"},
  {id:"cp_12", title:"Lorentz Force",                            cat:"4C: Electrochemistry"},
  {id:"cp_13", title:"Electrochemistry",                         cat:"4C: Electrochemistry"},
  {id:"cp_14", title:"Nerve Cell Electrophysiology (Physics)",   cat:"4C: Electrochemistry"},
  {id:"cp_15", title:"Sound & Acoustics",                        cat:"4D: Light & Sound"},
  {id:"cp_16", title:"Electromagnetic Radiation & Absorption",   cat:"4D: Light & Sound"},
  {id:"cp_17", title:"Light & Optics",                           cat:"4D: Light & Sound"},
  {id:"cp_18", title:"Molecular Absorption Spectra",             cat:"4D: Light & Sound"},
  {id:"cp_19", title:"Geometrical Optics: Lenses & Mirrors",     cat:"4D: Light & Sound"},
  {id:"cp_20", title:"Atomic Nucleus & Radioactive Decay",       cat:"4E: Atomic Structure"},
  {id:"cp_21", title:"Electronic Structure & Quantum Numbers",   cat:"4E: Atomic Structure"},
  {id:"cp_22", title:"Periodic Table: Electronic Structure",     cat:"4E: Atomic Structure"},
  {id:"cp_23", title:"Periodic Trends",                          cat:"4E: Atomic Structure"},
  {id:"cp_24", title:"Stoichiometry & Redox Reactions",          cat:"4E: Atomic Structure"},
  {id:"cp_25", title:"Overview: Chemical & Physical Foundations",cat:"Overview"},
  {id:"cp_26", title:"Acid-Base Equilibria",                     cat:"5A: Aqueous Chemistry"},
  {id:"cp_27", title:"Ions in Solution",                         cat:"5A: Aqueous Chemistry"},
  {id:"cp_28", title:"Polyatomic Ions & Nomenclature",           cat:"5A: Aqueous Chemistry"},
  {id:"cp_29", title:"Solubility & Ksp",                         cat:"5A: Aqueous Chemistry"},
  {id:"cp_30", title:"Titration",                                cat:"5A: Aqueous Chemistry"},
  {id:"cp_31", title:"Covalent Bonding",                         cat:"5B: Molecular Structure"},
  {id:"cp_32", title:"Molecular Geometry & VSEPR",               cat:"5B: Molecular Structure"},
  {id:"cp_33", title:"Intermolecular Forces",                    cat:"5B: Molecular Structure"},
  {id:"cp_34", title:"Separations & Purifications",              cat:"5C: Separations"},
  {id:"cp_35", title:"Chromatography & Analytical Methods",      cat:"5C: Separations"},
  {id:"cp_36", title:"Nucleotides & Nucleic Acids (Chemistry)",  cat:"5D: Organic Chemistry"},
  {id:"cp_37", title:"Amino Acids & Proteins (Chemistry)",       cat:"5D: Organic Chemistry"},
  {id:"cp_38", title:"Protein Function (Chemistry Context)",     cat:"5D: Organic Chemistry"},
  {id:"cp_39", title:"Lipids (Chemistry)",                       cat:"5D: Organic Chemistry"},
  {id:"cp_40", title:"Carbohydrates (Chemistry)",                cat:"5D: Organic Chemistry"},
  {id:"cp_41", title:"Aldehydes & Ketones",                      cat:"5D: Organic Chemistry"},
  {id:"cp_42", title:"Alcohols & Ethers",                        cat:"5D: Organic Chemistry"},
  {id:"cp_43", title:"Carboxylic Acids",                         cat:"5D: Organic Chemistry"},
  {id:"cp_44", title:"Acid Derivatives: Esters, Amides, Anhydrides", cat:"5D: Organic Chemistry"},
  {id:"cp_45", title:"Phenols",                                  cat:"5D: Organic Chemistry"},
  {id:"cp_46", title:"Aromatic & Heterocyclic Compounds",        cat:"5D: Organic Chemistry"},
  {id:"cp_47", title:"Enzyme Kinetics (Chemistry Context)",      cat:"5D: Organic Chemistry"},
  {id:"cp_48", title:"Bioenergetics & Free Energy",              cat:"5E: Thermodynamics"},
  {id:"cp_49", title:"Energy Changes in Chemical Reactions",     cat:"5E: Thermodynamics"},
  {id:"cp_50", title:"Thermochemistry & Thermodynamics",         cat:"5E: Thermodynamics"},
  {id:"cp_51", title:"Reaction Kinetics",                        cat:"5E: Thermodynamics"},
  {id:"cp_52", title:"Chemical Equilibrium",                     cat:"5E: Thermodynamics"},
],
ps: [
  {id:"ps_0",  title:"Sensory Processing",                       cat:"6A: Sensation & Perception"},
  {id:"ps_1",  title:"Psychophysics: Threshold & Weber's Law",   cat:"6A: Sensation & Perception"},
  {id:"ps_2",  title:"Vision",                                   cat:"6A: Sensation & Perception"},
  {id:"ps_3",  title:"Hearing & Auditory Processing",            cat:"6A: Sensation & Perception"},
  {id:"ps_4",  title:"Other Senses: Taste, Smell, Touch, Pain",  cat:"6A: Sensation & Perception"},
  {id:"ps_5",  title:"Perception",                               cat:"6A: Sensation & Perception"},
  {id:"ps_6",  title:"Attention",                                cat:"6B: Cognition & Memory"},
  {id:"ps_7",  title:"Sociocultural Influences on Cognition",    cat:"6B: Cognition & Memory"},
  {id:"ps_8",  title:"Biological Bases of Cognition",            cat:"6B: Cognition & Memory"},
  {id:"ps_9",  title:"Cognition & Piaget's Stages",              cat:"6B: Cognition & Memory"},
  {id:"ps_10", title:"Consciousness & Sleep",                    cat:"6B: Cognition & Memory"},
  {id:"ps_11", title:"Memory Types & Processes",                 cat:"6B: Cognition & Memory"},
  {id:"ps_12", title:"Memory Disorders (Korsakoff, HM)",         cat:"6B: Cognition & Memory"},
  {id:"ps_13", title:"Language & Brain",                         cat:"6B: Cognition & Memory"},
  {id:"ps_14", title:"Emotion",                                  cat:"6C: Emotion & Stress"},
  {id:"ps_15", title:"Theories of Emotion",                      cat:"6C: Emotion & Stress"},
  {id:"ps_16", title:"Stress & the Stress Response",             cat:"6C: Emotion & Stress"},
  {id:"ps_17", title:"Overview: Psychological Foundations",      cat:"Overview"},
  {id:"ps_18", title:"Biological Bases of Behavior",             cat:"7A: Individual Behavior"},
  {id:"ps_19", title:"Personality Theories",                     cat:"7A: Individual Behavior"},
  {id:"ps_20", title:"Psychological Disorders",                  cat:"7A: Individual Behavior"},
  {id:"ps_21", title:"Motivation",                               cat:"7A: Individual Behavior"},
  {id:"ps_22", title:"Attitudes & Cognitive Dissonance",         cat:"7A: Individual Behavior"},
  {id:"ps_23", title:"Social Processes Overview",                cat:"7B: Social Processes"},
  {id:"ps_24", title:"Groups & Social Norms",                    cat:"7B: Social Processes"},
  {id:"ps_25", title:"Social Facilitation & Bystander Effect",   cat:"7B: Social Processes"},
  {id:"ps_26", title:"Group Behavior",                           cat:"7B: Social Processes"},
  {id:"ps_27", title:"Group Decision-Making & Groupthink",       cat:"7B: Social Processes"},
  {id:"ps_28", title:"Normative Behavior, Deviance & Sanctions", cat:"7B: Social Processes"},
  {id:"ps_29", title:"Socialization",                            cat:"7B: Social Processes"},
  {id:"ps_30", title:"Habituation & Dishabituation",             cat:"7C: Learning"},
  {id:"ps_31", title:"Classical & Operant Conditioning",         cat:"7C: Learning"},
  {id:"ps_32", title:"Observational Learning (Bandura)",         cat:"7C: Learning"},
  {id:"ps_33", title:"Attitude & Behavior Change",               cat:"7C: Learning"},
  {id:"ps_34", title:"Overview: Social Foundations",             cat:"Overview"},
  {id:"ps_35", title:"Formation of Identity (Erikson)",          cat:"8A-B: Identity & Social Thinking"},
  {id:"ps_36", title:"Attribution Theory",                       cat:"8A-B: Identity & Social Thinking"},
  {id:"ps_37", title:"Social Cognition & Stereotypes",           cat:"8A-B: Identity & Social Thinking"},
  {id:"ps_38", title:"Prejudice & Bias",                         cat:"8A-B: Identity & Social Thinking"},
  {id:"ps_39", title:"Stereotype Threat & Implicit Bias",        cat:"8A-B: Identity & Social Thinking"},
  {id:"ps_40", title:"Elements of Social Interaction",           cat:"8C: Social Interactions"},
  {id:"ps_41", title:"Social Perception & Impression Formation", cat:"8C: Social Interactions"},
  {id:"ps_42", title:"Social Behavior: Conformity & Obedience",  cat:"8C: Social Interactions"},
  {id:"ps_43", title:"Discrimination",                           cat:"8C: Social Interactions"},
  {id:"ps_44", title:"Overview: Social Interaction",             cat:"Overview"},
  {id:"ps_45", title:"Sociological Theory",                      cat:"9A: Social Structure"},
  {id:"ps_46", title:"Social Structure Overview",                cat:"9A: Social Structure"},
  {id:"ps_47", title:"Social Institutions",                      cat:"9A: Social Structure"},
  {id:"ps_48", title:"Culture",                                  cat:"9A: Social Structure"},
  {id:"ps_49", title:"Demographic Structure",                    cat:"9B: Demographics"},
  {id:"ps_50", title:"Aging & Life Course",                      cat:"9B: Demographics"},
  {id:"ps_51", title:"Demographic Shifts & Social Change",       cat:"9B: Demographics"},
  {id:"ps_52", title:"Overview: Society",                        cat:"Overview"},
  {id:"ps_53", title:"Spatial Inequality",                       cat:"10A: Social Inequality"},
  {id:"ps_54", title:"Barriers to Institutional Resources",      cat:"10A: Social Inequality"},
  {id:"ps_55", title:"Social Class & Stratification",            cat:"10A: Social Inequality"},
  {id:"ps_56", title:"Health Disparities",                       cat:"10A: Social Inequality"},
  {id:"ps_57", title:"Healthcare Disparities",                   cat:"10A: Social Inequality"},
],
cars: [
  {id:"cars_0", title:"CARS: Foundations of Comprehension",      cat:"Critical Analysis"},
  {id:"cars_1", title:"CARS: Reasoning Within the Text",         cat:"Critical Analysis"},
  {id:"cars_2", title:"CARS: Reasoning Beyond the Text",         cat:"Critical Analysis"},
],
};

// ─── PRE-BUILT LESSONS (high-yield topics) ────────────────────────────────────
var PREBUILT_LESSONS = {
"bb_0": {keyPoints:["All amino acids (except glycine) have a chiral L alpha-carbon","At pH 7.4, amino acids exist as zwitterions (both + and - charge)","Classify by R-group: nonpolar, polar uncharged, basic (+), acidic (-)","Cysteine forms disulfide bonds — critical for 3D protein structure","Peptide bond = amide bond formed releasing water (condensation)"],deepDive:"The R-group determines each amino acid's role. Nonpolar AAs (Ala, Val, Leu, Ile, Met, Phe, Trp, Pro) are hydrophobic — found in protein interiors. Polar uncharged (Ser, Thr, Cys, Tyr, Asn, Gln) form H-bonds. Basic at pH 7: Lys, Arg, His. Acidic at pH 7: Asp, Glu.\n\nIsoelectric point (pI) = pH at which AA has no net charge. Acidic AAs: pI less than 7. Basic AAs: pI greater than 7. At pH above pI, protein is negative. At pH below pI, positive.\n\nProline has a rigid ring that disrupts alpha helices. Glycine is the smallest AA (H side chain) — most flexible. Cysteine disulfide bonds are the only covalent cross-links in protein tertiary structure.",clinicalRelevance:"PKU = inability to metabolize phenylalanine, causes brain damage. Sickle cell = Glu to Val substitution in hemoglobin (single nucleotide change). Albinism = defect in tyrosine metabolism. Maple syrup urine disease = BCAA metabolism defect.",memorize:["Charged at pH 7: (+) Lys, Arg, His | (-) Asp, Glu","Cysteine = disulfide bonds. Proline = disrupts alpha helices","pI = average of relevant pKa values. Below pI = positive charge, above pI = negative"]},
"bb_3": {keyPoints:["Enzymes lower activation energy without being consumed","Active site = specific region that binds substrate (lock and key vs. induced fit)","Cofactors are inorganic (metal ions). Coenzymes are organic (often vitamins)","Enzyme classification: oxidoreductases, transferases, hydrolases, lyases, isomerases, ligases","Substrate specificity determined by active site shape and chemistry"],deepDive:"Induced fit model: enzyme changes shape upon substrate binding — more accurate than rigid lock-and-key. The active site creates an ideal microenvironment for catalysis (optimal pH, charge distribution).\n\nCofactors are required non-protein components. Metal ion cofactors (Zn2+, Fe2+, Mg2+) often directly participate in catalysis. Coenzymes (NAD+, FAD, CoA) are organic molecules that act as electron or group carriers.\n\nZymogens are inactive enzyme precursors activated by cleavage (pepsinogen → pepsin). This prevents unwanted enzymatic activity in the wrong location.",clinicalRelevance:"Statins inhibit HMG-CoA reductase (cholesterol synthesis). Many poisons are enzyme inhibitors (cyanide blocks cytochrome c oxidase). Vitamins as coenzyme precursors explains why vitamin deficiency causes disease.",memorize:["Cofactor = inorganic (metal ions). Coenzyme = organic (vitamins)","Induced fit: enzyme changes shape to fit substrate","Zymogen = inactive precursor activated by cleavage"]},
"bb_4": {keyPoints:["Km = substrate concentration at Vmax/2. Low Km = high affinity","Vmax = maximum rate when all active sites are saturated","Competitive inhibition: increased Km, same Vmax — overcome with more substrate","Non-competitive inhibition: same Km, decreased Vmax — cannot overcome","Uncompetitive inhibition: decreases BOTH Km AND Vmax"],deepDive:"Michaelis-Menten: v = Vmax[S]/(Km + [S]). At [S] = Km: v = Vmax/2. At [S] >> Km: zero order (rate constant). At [S] << Km: first order (rate proportional to [S]).\n\nLineweaver-Burk plot (1/v vs 1/[S]): Y-intercept = 1/Vmax, X-intercept = -1/Km. Competitive: same Y-intercept (same Vmax), different X-intercept. Non-competitive: same X-intercept (same Km), different Y-intercept.\n\nAllosteric enzymes show sigmoidal (S-shaped) kinetics due to cooperativity. Positive cooperativity: first binding makes subsequent binding easier. Hemoglobin is the classic example.",clinicalRelevance:"Drug design uses competitive inhibitors (statins, ACE inhibitors, many antibiotics). Organophosphates are irreversible AChE inhibitors causing neurotoxicity. Methotrexate is a competitive inhibitor of dihydrofolate reductase used in cancer.",memorize:["Competitive: up Km, same Vmax | Non-competitive: same Km, down Vmax | Uncompetitive: down both","Low Km = high affinity for substrate","Allosteric = sigmoidal curve, not hyperbolic"]},
"bb_8": {keyPoints:["Central Dogma: DNA → RNA → Protein (Crick, 1958)","Triplet code: 3 nucleotides (codon) = 1 amino acid","Code is degenerate (redundant): multiple codons can code for the same AA","AUG = start codon (Met). UAA, UAG, UGA = stop codons","Wobble position: third base of codon has more flexibility in pairing"],deepDive:"There are 64 possible codons (4^3) for 20 amino acids — hence degeneracy. The genetic code is nearly universal across all life (with minor exceptions in mitochondria and some organisms).\n\nMissense mutation: one codon changed → different amino acid. Nonsense mutation: codon changed to stop codon → premature termination. Silent mutation: codon changed but same amino acid (due to degeneracy). Frameshift: insertion/deletion shifts reading frame → altered downstream sequence.\n\nTemple strand read 3' to 5'. mRNA synthesized 5' to 3'. Codons are read on mRNA. Anticodons are on tRNA and are antiparallel/complementary to codons.",clinicalRelevance:"Sickle cell = missense (GAG → GTG = Glu → Val). Beta-thalassemia often caused by nonsense mutations. Cystic fibrosis = deletion of 3 nucleotides (in-frame deletion, not frameshift). Understanding the genetic code essential for CRISPR and gene therapy.",memorize:["AUG = start (Met). UAA, UAG, UGA = stop codons","Missense = wrong AA. Nonsense = premature stop. Silent = same AA. Frameshift = shifted reading","Code is degenerate (redundant) but not ambiguous (one codon = one AA)"]},
"bb_16": {keyPoints:["Dominant alleles mask recessive ones in heterozygotes","Homozygous dominant (AA) and heterozygous (Aa) have same phenotype","Punnett squares predict offspring ratios","Law of Segregation: alleles separate during gamete formation","Law of Independent Assortment: genes on different chromosomes assort independently"],deepDive:"Monohybrid cross: Aa x Aa → 1 AA : 2 Aa : 1 aa (3:1 phenotypic ratio). Dihybrid cross (AaBb x AaBb) → 9:3:3:1 ratio (when genes are unlinked).\n\nIncomplete dominance: heterozygote shows intermediate phenotype (red + white = pink). Codominance: both alleles fully expressed (ABO blood type, sickle cell trait). Multiple alleles: more than two alleles possible in population (ABO: IA, IB, i).\n\nX-linked inheritance: traits encoded on X chromosome. Affected males (XY) have only one X. Females can be carriers. X-linked recessive: more common in males. Hemophilia, color blindness, Duchenne MD are classic examples.",clinicalRelevance:"Cystic fibrosis = autosomal recessive. Huntington's disease = autosomal dominant. Hemophilia A = X-linked recessive. Neurofibromatosis = autosomal dominant with variable expressivity. Genetic counseling uses Mendelian principles.",memorize:["Monohybrid Aa x Aa: 3:1 phenotype ratio, 1:2:1 genotype ratio","X-linked recessive: more common in males (sons of carrier mothers)","Incomplete dominance = blending. Codominance = both expressed fully"]},
"bb_19": {keyPoints:["Meiosis produces 4 haploid cells (gametes) from 1 diploid cell","Meiosis I: homologous chromosomes separate (reduction division)","Meiosis II: sister chromatids separate (like mitosis)","Crossing over occurs in Prophase I (increases genetic diversity)","Independent assortment of chromosomes adds more diversity"],deepDive:"Meiosis I stages: Prophase I (crossing over, synapsis, tetrads form), Metaphase I (tetrads line up), Anaphase I (homologs separate), Telophase I. After meiosis I: 2 haploid cells, each with 2 sister chromatids.\n\nMeiosis II is like mitosis: Prophase II → Metaphase II → Anaphase II (sister chromatids separate) → Telophase II. Result: 4 haploid cells.\n\nNon-disjunction: failure of chromosomes to separate properly. In Meiosis I: all gametes abnormal. In Meiosis II: some abnormal, some normal. Results in aneuploidy (trisomy 21 = Down syndrome, monosomy X = Turner syndrome, XXY = Klinefelter).",clinicalRelevance:"Down syndrome (trisomy 21): usually from non-disjunction in maternal meiosis I. Turner syndrome (45,X): monosomy X. Klinefelter (47,XXY). Maternal age increases risk of non-disjunction. Chorionic villus sampling and amniocentesis diagnose chromosomal abnormalities.",memorize:["Meiosis I = homologs separate. Meiosis II = sister chromatids separate","Crossing over = Prophase I. Increases genetic variation","Non-disjunction in Meiosis I = ALL gametes abnormal. In Meiosis II = SOME abnormal"]},
"bb_22": {keyPoints:["Natural selection: differential reproductive success based on heritable traits","Fitness = reproductive success, not physical strength","Hardy-Weinberg: p^2 + 2pq + q^2 = 1; p + q = 1","H-W equilibrium assumes: large population, random mating, no mutation/migration/selection","Genetic drift: random changes in allele frequency (stronger in small populations)"],deepDive:"Types of natural selection: directional (one extreme favored), stabilizing (middle favored, reduces variation), disruptive (both extremes favored). Sexual selection: traits favored for mate attraction even if costly for survival.\n\nSpeciation: allopatric (geographic isolation), sympatric (without geographic isolation), parapatric (adjacent populations). Prezygotic barriers (habitat, temporal, behavioral, mechanical, gametic) and postzygotic barriers (hybrid inviability, sterility).\n\nMolecular evolution: mutations are the ultimate source of variation. Neutral mutations persist by genetic drift. Gene flow spreads alleles between populations. Bottleneck effect: dramatic population reduction → loss of genetic diversity.",clinicalRelevance:"Antibiotic resistance is natural selection in action. Sickle cell heterozygote advantage (malaria resistance) is a classic example of balancing selection. Understanding evolution is fundamental to understanding infectious disease and cancer.",memorize:["Hardy-Weinberg: p^2 + 2pq + q^2 = 1. Deviations indicate evolutionary forces acting","Genetic drift is strongest in small populations (founder effect, bottleneck)","Fitness = reproductive success, not strength or health"]},
"bb_26": {keyPoints:["Glycolysis: glucose (6C) → 2 pyruvate (3C), net 2 ATP, 2 NADH, in cytoplasm","Investment phase: uses 2 ATP (hexokinase, PFK-1). Payoff phase: produces 4 ATP","PFK-1 is the key regulatory enzyme of glycolysis","Gluconeogenesis: makes glucose from pyruvate, lactate, amino acids, glycerol","Gluconeogenesis bypasses irreversible glycolytic steps (uses unique enzymes)"],deepDive:"Glycolysis key steps: Glucose → G6P (hexokinase, uses ATP) → F6P → F1,6BP (PFK-1, uses ATP, REGULATED) → DHAP + G3P → ... → pyruvate (pyruvate kinase). Net: 2 ATP (substrate-level phosphorylation), 2 NADH.\n\nRegulation of glycolysis: PFK-1 inhibited by ATP, citrate (energy abundant); activated by AMP, ADP, fructose-2,6-bisphosphate. Reciprocal regulation: when glycolysis is ON, gluconeogenesis is OFF and vice versa.\n\nGluconeogenesis bypasses: pyruvate kinase → PEP carboxykinase/pyruvate carboxylase. PFK-1 → fructose-1,6-bisphosphatase. Hexokinase → glucose-6-phosphatase (liver only — allows glucose release into blood). Cori cycle: muscle lactate → liver → glucose → muscle.",clinicalRelevance:"Diabetes disrupts glucose regulation. Metformin inhibits complex I of ETC, reducing NADH → activates AMPK → inhibits gluconeogenesis. Fasting: gluconeogenesis in liver maintains blood glucose. Glycogen storage diseases affect glucose mobilization.",memorize:["Glycolysis: 2 ATP invested, 4 ATP produced = 2 net ATP. Cytoplasm. Anaerobic capable","PFK-1 is the rate-limiting enzyme of glycolysis. Inhibited by ATP, activated by AMP","Gluconeogenesis unique enzymes: pyruvate carboxylase, PEPCK, F1,6BPase, G6Pase"]},
"bb_29": {keyPoints:["Krebs cycle occurs in the mitochondrial matrix","Per acetyl-CoA turn: 3 NADH, 1 FADH2, 1 GTP, 2 CO2","Per glucose (2 turns): 6 NADH, 2 FADH2, 2 GTP","Acetyl-CoA (2C) combines with oxaloacetate (4C) to form citrate (6C)","Oxaloacetate is regenerated — the cycle"],deepDive:"Steps: Acetyl-CoA + OAA → citrate (citrate synthase) → isocitrate → alpha-ketoglutarate (NADH, CO2) → succinyl-CoA (NADH, CO2) → succinate (GTP) → fumarate (FADH2) → malate → OAA (NADH).\n\nRegulation: inhibited by ATP, NADH, succinyl-CoA (product inhibition); activated by ADP, NAD+, Ca2+. Key regulated enzymes: citrate synthase, isocitrate dehydrogenase, alpha-ketoglutarate dehydrogenase.\n\nConnections to other pathways: Krebs intermediates are precursors for amino acids, heme synthesis, and gluconeogenesis (anaplerotic reactions replenish oxaloacetate).",clinicalRelevance:"Thiamine (B1) deficiency impairs alpha-ketoglutarate dehydrogenase → Wernicke encephalopathy. Fluoroacetate (poison) inhibits aconitase, blocking citrate processing. Krebs cycle intermediates used in nitrogen metabolism and biosynthesis.",memorize:["Per turn: 3 NADH + 1 FADH2 + 1 GTP + 2 CO2. Per glucose: x2","Acetyl-CoA (2C) + OAA (4C) = Citrate (6C). Two CO2 released. OAA regenerated","Regulated by: inhibited by ATP/NADH, activated by ADP/NAD+/Ca2+"]},
"bb_31": {keyPoints:["ETC occurs on inner mitochondrial membrane. ATP synthase in same location","Electrons from NADH and FADH2 drive proton pumping across inner membrane","Proton gradient (chemiosmosis) drives ATP synthesis by ATP synthase","NADH = ~2.5 ATP. FADH2 = ~1.5 ATP. Total from glucose: ~30-32 ATP","O2 is the final electron acceptor → forms water"],deepDive:"ETC complexes: Complex I (NADH dehydrogenase) → ubiquinone → Complex II (succinate dehydrogenase) → ubiquinone → Complex III → cytochrome c → Complex IV (cytochrome c oxidase) → O2 → H2O.\n\nProton pumping: Complexes I, III, IV pump H+ into intermembrane space. This creates proton motive force (electrochemical gradient). ATP synthase (Complex V) uses proton flow back into matrix to synthesize ATP.\n\nInhibitors: cyanide and CO block Complex IV (same symptoms: tissue hypoxia). Rotenone blocks Complex I. Oligomycin blocks ATP synthase. 2,4-DNP = uncoupler (makes membrane leaky to H+ → heat instead of ATP — used by brown adipose tissue).",clinicalRelevance:"Cyanide poisoning blocks Complex IV → cells cannot use O2 → lactic acidosis. Metformin inhibits Complex I. MELAS syndrome = mitochondrial disease affecting ETC. Brown adipose tissue uses thermogenin (UCP1) to uncouple respiration for heat.",memorize:["NADH enters at Complex I, FADH2 at Complex II. Both end at Complex IV with O2","Chemiosmosis: proton gradient drives ATP synthase. Mitchell's hypothesis","Cyanide/CO block Complex IV. Uncouplers (DNP) dissipate proton gradient as heat"]},
"bb_35": {keyPoints:["Lipid bilayer: two layers of phospholipids, hydrophilic heads out, hydrophobic tails in","Fluid mosaic model: membrane is fluid, proteins float in the lipid bilayer","Peripheral proteins attach to surface. Integral proteins span the bilayer (transmembrane)","Cholesterol stabilizes membrane fluidity: prevents too fluid at high temp, too rigid at low","Membrane is selectively permeable: small/nonpolar cross freely, large/polar need help"],deepDive:"Phospholipid structure: glycerol backbone + 2 fatty acids + phosphate group + head group. Saturated fatty acids = straight tails, pack tightly (less fluid). Unsaturated (kinked) = more fluid membrane.\n\nTransport across membrane: Simple diffusion (small, nonpolar: O2, CO2, steroid hormones). Facilitated diffusion (with carrier or channel, with gradient, no ATP). Active transport (against gradient, requires ATP — Na+/K+ ATPase pumps 3 Na+ out, 2 K+ in per ATP).\n\nEndocytosis and exocytosis: bulk transport via membrane vesicles. Receptor-mediated endocytosis uses clathrin-coated pits. Phagocytosis (cell eating), pinocytosis (cell drinking).",clinicalRelevance:"Cystic fibrosis = defective CFTR chloride channel. Cholera toxin = constitutively activates adenylyl cyclase → massive Cl- and water secretion. Na+/K+ ATPase essential for nerve and muscle function (cardiac glycosides inhibit it).",memorize:["Fluid mosaic model: lipid bilayer with floating proteins","Simple diffusion (no energy): small, nonpolar. Active transport (needs ATP): against gradient","Na+/K+ ATPase: 3 Na+ out, 2 K+ in per ATP. Maintains resting membrane potential"]},
"bb_52": {keyPoints:["Cell cycle: G1 → S (DNA synthesis) → G2 → M (mitosis) → C (cytokinesis)","G0 = quiescent state (most adult neurons, muscle cells)","Checkpoints: G1/S checks DNA integrity, G2/M checks DNA replication completion","Cyclins + CDKs drive cell cycle progression. Tumor suppressors (p53, Rb) apply brakes","Mitosis phases: PMAT — Prophase, Metaphase, Anaphase, Telophase"],deepDive:"Prophase: chromatin condenses, spindle forms, nuclear envelope breaks down. Prometaphase: spindle attaches to kinetochores. Metaphase: chromosomes align at metaphase plate. Anaphase: sister chromatids pulled to poles. Telophase: nuclear envelope reforms, chromosomes decondense. Cytokinesis: cleavage furrow in animals, cell plate in plants.\n\nCell cycle regulation: cyclins oscillate (D, E for G1/S; A, B for G2/M). CDKs are constitutively expressed but require cyclin binding. p53 = guardian of the genome — induces p21 (CDK inhibitor) or apoptosis. Rb (retinoblastoma protein) inhibits E2F transcription factor.\n\nCancer = uncontrolled cell division from mutations in proto-oncogenes (become oncogenes) or tumor suppressors. Two-hit hypothesis for tumor suppressors.",clinicalRelevance:"Colchicine/vinblastine block microtubule polymerization (used in cancer chemo). Taxol stabilizes microtubules. Li-Fraumeni syndrome = p53 mutation. Retinoblastoma = Rb mutation. Cyclins B1/CDK1 dysregulation common in cancer.",memorize:["PMAT: Prophase, Metaphase (alignment), Anaphase (apart), Telophase","G1/S checkpoint: is DNA intact? G2/M checkpoint: is DNA fully replicated?","Cyclins + CDKs = gas pedal. p53, Rb = brakes. Cancer = brakes fail or gas stuck"]},
"bb_59": {keyPoints:["Resting membrane potential: -70 mV (inside negative) maintained by Na+/K+ ATPase","Action potential: depolarization (Na+ in) → repolarization (K+ out) → hyperpolarization","All-or-nothing: action potential either fully fires or doesn't","Refractory period: absolute (cannot fire again) then relative (harder to fire)","Propagation: saltatory conduction along myelinated axons (node to node, faster)"],deepDive:"Resting state: Na+/K+ ATPase pumps 3 Na+ out, 2 K+ in. K+ leakage channels open. Inside negative. Threshold ~-55 mV.\n\nDepolarization: Na+ channels open → Na+ rushes in → inside becomes positive. At +30 mV, Na+ channels inactivate. Repolarization: K+ channels open → K+ rushes out → returns to negative. Brief hyperpolarization before returning to resting potential.\n\nSynaptic transmission: action potential → Ca2+ enters presynaptic terminal → vesicles fuse → neurotransmitter released → binds postsynaptic receptors → EPSP or IPSP. Summation: temporal (repeated stimuli) or spatial (multiple inputs).",clinicalRelevance:"Local anesthetics (lidocaine) block voltage-gated Na+ channels. Tetrodotoxin (puffer fish) also blocks Na+ channels. Multiple sclerosis = demyelination → slowed conduction. Lambert-Eaton syndrome = autoantibodies to Ca2+ channels at NMJ.",memorize:["Resting potential -70 mV. Threshold -55 mV. Peak +30 mV","Depolarization = Na+ in. Repolarization = K+ out. Na+/K+ pump restores gradient","Myelination increases speed (saltatory conduction). MS = demyelination = slowed signals"]},
"bb_71": {keyPoints:["Innate immunity: nonspecific, immediate (within minutes), includes barriers, phagocytes, NK cells","Adaptive immunity: specific, slower (days), has memory, involves B and T lymphocytes","T cells mature in thymus. B cells mature in bone marrow","CD4+ helper T cells coordinate immune response. CD8+ cytotoxic T cells kill infected cells","B cells → plasma cells → antibodies (immunoglobulins: IgG, IgM, IgA, IgE, IgD)"],deepDive:"Innate immunity components: physical barriers (skin, mucous membranes), phagocytes (neutrophils, macrophages), natural killer cells, complement system, inflammation.\n\nAdaptive immunity: antigen presented on MHC molecules. MHC I (all nucleated cells) → activates CD8+ T cells. MHC II (APCs: macrophages, dendritic cells, B cells) → activates CD4+ T cells.\n\nAntibody structure: 2 heavy chains + 2 light chains. Variable regions = antigen binding (Fab). Constant region = effector functions (Fc). IgM = first responder (pentamer). IgG = main blood antibody, crosses placenta. IgA = secretions (breast milk, saliva). IgE = allergies and parasites.",clinicalRelevance:"HIV infects CD4+ T cells. DiGeorge syndrome = thymic aplasia (no T cells). Agammaglobulinemia (Bruton's) = no B cells. Systemic lupus = autoimmune (anti-DNA antibodies). Vaccines work by creating immunological memory.",memorize:["MHC I = all nucleated cells → CD8+ T cells. MHC II = APCs → CD4+ T cells","IgM = first response. IgG = main response, crosses placenta. IgA = secretions. IgE = allergies","B cells → plasma cells → antibodies. Memory B and T cells persist for future response"]},
"cp_0": {keyPoints:["Displacement = change in position (vector). Distance = total path length (scalar)","Velocity = displacement/time (vector). Speed = distance/time (scalar)","Acceleration = change in velocity/time. Constant acceleration equations apply","Projectile motion: horizontal velocity constant, vertical has acceleration g = 9.8 m/s2","Relative motion: add or subtract velocity vectors depending on reference frame"],deepDive:"Kinematic equations (constant acceleration): v = v0 + at. x = v0t + 1/2at2. v2 = v02 + 2ax. x = (v0+v)/2 * t.\n\nProjectile motion: horizontal (x): vx = v0cos(theta), constant. Vertical (y): vy = v0sin(theta) - gt, a = -9.8 m/s2. At peak: vy = 0. Time of flight and range depend on launch angle.\n\nFree fall: object in gravitational field (ignoring air resistance). Dropped object: v = gt. Thrown downward: v = v0 + gt. All objects fall at same acceleration regardless of mass (Galileo).",clinicalRelevance:"Understanding velocity and acceleration crucial for interpreting nerve conduction, blood flow dynamics, and muscle mechanics. Centripetal acceleration relevant to centrifuge-based lab techniques.",memorize:["Big 4 kinematic equations require constant acceleration","Projectile motion: horizontal = constant velocity, vertical = constant acceleration g","At maximum height of projectile, vy = 0 but vx remains unchanged"]},
"cp_1": {keyPoints:["Newton's 1st: object stays in motion/rest unless acted on by net force (inertia)","Newton's 2nd: F = ma. Net force = mass x acceleration","Newton's 3rd: every action has equal and opposite reaction (different objects)","Weight = mg (downward). Normal force perpendicular to surface. Friction = mu x N","Free body diagrams: draw all forces on one object, sum to find net force"],deepDive:"Types of friction: static friction (prevents motion, max = us x N) and kinetic friction (during motion = uk x N, usually less than static). Friction always opposes relative motion.\n\nInclined planes: weight component along plane = mg sin(theta). Normal force = mg cos(theta). Net force along plane = mg sin(theta) - friction.\n\nCircular motion requires centripetal force: Fc = mv2/r directed toward center. This is not a separate force — it's the NET force pointing inward. Tension, gravity, or normal force provides centripetal force depending on situation.",clinicalRelevance:"Force analysis in biomechanics (joint forces, muscle mechanics). Centripetal acceleration in heart (turning blood flow). Newton's 3rd Law explains why muscles must contract against bone resistance.",memorize:["F = ma. Net force determines acceleration. Zero net force = constant velocity","Weight = mg (downward). Normal force perpendicular to surface","Centripetal force = mv2/r. Points toward center. NOT a separate force — it's the net force"]},
"cp_7": {keyPoints:["Ideal Gas Law: PV = nRT. R = 8.314 J/mol K (or 0.0821 L atm/mol K)","Boyle's Law: P1V1 = P2V2 (constant T, n). Pressure and volume inversely proportional","Charles's Law: V1/T1 = V2/T2 (constant P, n). Volume and temperature proportional","Dalton's Law: total pressure = sum of partial pressures. Pi = Xi x Ptotal","Real gases deviate from ideal at high pressure and low temperature"],deepDive:"Assumptions of ideal gas: molecules have no volume, no intermolecular forces. Works well at low pressure and high temperature.\n\nGraham's Law of Effusion: rate1/rate2 = sqrt(M2/M1). Lighter gases effuse faster. Used to separate isotopes (uranium enrichment) and in clinical respiratory analysis.\n\nKinetic molecular theory: average kinetic energy = 3/2 kBT. At same temperature, all gases have same average KE. Lighter molecules move faster. Root-mean-square speed = sqrt(3RT/M).",clinicalRelevance:"Respiratory physiology: alveolar gas equation, partial pressures of O2 and CO2. Hyperbaric chambers increase gas partial pressures. Anesthesia uses gas laws (MAC values). Dissolved gas bubbles in decompression sickness (Henry's Law).",memorize:["PV = nRT. Know R = 8.314 J/mol K for energy, 0.0821 L atm/mol K for volume","Boyle: PV = constant. Charles: V/T = constant. Combined: P1V1/T1 = P2V2/T2","Dalton: partial pressures are additive. Each gas behaves independently"]},
"cp_10": {keyPoints:["Ohm's Law: V = IR. Voltage (V) = Current (I) x Resistance (R)","Resistors in series: R_total = R1 + R2 + ... Same current through each","Resistors in parallel: 1/R_total = 1/R1 + 1/R2 + ... Same voltage across each","Power: P = IV = I2R = V2/R. Power dissipated as heat in resistor","Capacitor stores charge: C = Q/V. In parallel: C_total = C1+C2. In series: 1/C = 1/C1+1/C2"],deepDive:"Kirchhoff's Laws: Junction rule (KCL): sum of currents entering = leaving a junction (charge conservation). Loop rule (KVL): sum of voltage changes around a closed loop = 0 (energy conservation).\n\nCapacitors: store energy in electric field between plates. Energy = 1/2 CV2 = Q2/2C. Dielectric material between plates increases capacitance. Charging: current decreases exponentially (RC circuit, time constant tau = RC).\n\nBattery: EMF (electromotive force) drives current. Internal resistance r causes voltage drop. Terminal voltage = EMF - Ir. Batteries in series: voltages add. In parallel: capacity adds but voltage same.",clinicalRelevance:"Electrocardiogram (ECG/EKG) measures electrical activity of heart. Defibrillators use capacitors (large stored charge released quickly). Pacemakers use electronic circuits. Bioelectrical impedance used in body composition analysis.",memorize:["Series: R adds, same current, voltages add. Parallel: 1/R adds, same voltage, currents add","P = IV = I2R = V2/R. Higher resistance = more heat dissipation at same current","Capacitor: C = Q/V. Stores charge. In parallel = add. In series = reciprocal add"]},
"cp_13": {keyPoints:["Galvanic (voltaic) cell: spontaneous redox reaction generates electricity (ΔG < 0)","Electrolytic cell: non-spontaneous, requires electricity input (ΔG > 0)","Anode = oxidation (loss of electrons). Cathode = reduction (gain). Red Cat, An Ox","Standard cell potential: E°cell = E°cathode - E°anode. Positive = spontaneous","Nernst equation: E = E° - (RT/nF)lnQ. Relates cell potential to concentration"],deepDive:"Standard reduction potentials (E°red): more positive = better oxidizing agent. Table gives reduction reactions. Reverse reaction (oxidation) = flip sign.\n\nRelationship to thermodynamics: ΔG° = -nFE°. n = moles of electrons transferred. F = 96,485 C/mol (Faraday's constant). If E° > 0: ΔG° < 0 (spontaneous). ΔG° = -RT ln Keq.\n\nElectrolysis: Faraday's laws: mass deposited proportional to charge passed. Mass = (M/nF) x Q. Used in electroplating, aluminum production, chlorine production.\n\nConcentration cells: same electrode materials but different concentrations. Drives current as system moves toward equilibrium.",clinicalRelevance:"Nernst equation used to calculate equilibrium potential for ions across membranes (crucial for nerve physiology). Cardiac and neurological monitoring relies on electrochemical principles. Glucose sensors in diabetic monitors use amperometric electrochemistry.",memorize:["Anode = oxidation = negative in galvanic cell. Cathode = reduction = positive","E°cell = E°cathode - E°anode. Positive = spontaneous (ΔG < 0)","ΔG° = -nFE°. Connects electrochemistry to thermodynamics"]},
"cp_26": {keyPoints:["Strong acids/bases fully dissociate. pH = -log[H+]. pOH = -log[OH-]. pH + pOH = 14","Ka = acid dissociation constant. pKa = -log Ka. Smaller pKa = stronger acid","Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])","Buffer works best at pH = pKa (equal concentrations of acid and conjugate base)","Strong acids to memorize: HCl, HBr, HI, HNO3, H2SO4, HClO4"],deepDive:"Weak acid equilibrium: HA → H+ + A-. Ka = [H+][A-]/[HA]. For weak acid: [H+] = sqrt(Ka x C) when Ka << C.\n\nBuffer capacity: maximum near pKa (half of acid form, half base form). Adding strong acid converts A- to HA. Adding strong base converts HA to A-. Buffer is exhausted when all one form.\n\nTitration: equivalence point = stoichiometric neutralization. Weak acid + strong base → equivalence point pH > 7 (conjugate base is basic). Strong acid + strong base → equivalence point pH = 7. Half-equivalence point = pH = pKa (use to identify unknown acid experimentally).",clinicalRelevance:"Blood pH maintained at 7.4 by bicarbonate buffer (pKa = 6.1). Respiratory acidosis: CO2 accumulates (hypoventilation). Metabolic acidosis: excess H+ or loss of HCO3-. Kidneys adjust HCO3-, lungs adjust CO2. Protein buffers (imidazole of His) also important.",memorize:["Strong acids: HCl, HBr, HI, H2SO4, HNO3, HClO4 (memorize all 6)","Henderson-Hasselbalch: pH = pKa + log([base]/[acid]). At pKa, pH = pKa","Half-equivalence point = pH = pKa. Equivalence point weak acid/strong base: pH > 7"]},
"cp_50": {keyPoints:["ΔG = ΔH - TΔS. Negative ΔG = spontaneous. Positive ΔG = non-spontaneous","ΔH < 0: exothermic (releases heat). ΔH > 0: endothermic (absorbs heat)","ΔS > 0: entropy increases (more disorder). Gas > liquid > solid","ΔG° = -RT ln Keq. Positive Keq means products favored, ΔG° < 0","Hess's Law: ΔH is path-independent (additive for sequential steps)"],deepDive:"Spontaneity determination: If ΔH < 0 and ΔS > 0: always spontaneous. If ΔH > 0 and ΔS < 0: never spontaneous. If ΔH < 0 and ΔS < 0: spontaneous at LOW temperature. If ΔH > 0 and ΔS > 0: spontaneous at HIGH temperature.\n\nEntropy: increases when solid → liquid → gas. More particles = more entropy. Mixing increases entropy. ΔSuniverse = ΔSsystem + ΔSsurroundings ≥ 0 (2nd Law).\n\nTemperature effects: ΔG = ΔH - TΔS. Temperature amplifies the entropy term. High T favors entropy-driven reactions. Phase transitions occur when ΔG = 0 (at Tm or Tb).",clinicalRelevance:"ATP hydrolysis (ΔG° = -7.3 kcal/mol) drives biosynthesis. Protein folding driven by hydrophobic effect (entropy gain of solvent). Drug binding analyzed thermodynamically. Calorimetry measures heat of reactions in pharmaceutical development.",memorize:["ΔG = ΔH - TΔS. Negative ΔG = spontaneous. Zero ΔG = equilibrium","Spontaneous at all T: ΔH < 0 AND ΔS > 0. Never spontaneous: ΔH > 0 AND ΔS < 0","ΔG° = -RT ln Keq. Keq > 1 means ΔG° < 0 means products favored"]},
"ps_9": {keyPoints:["Piaget's Stage 1 - Sensorimotor (0-2): Object permanence develops ~8 months","Piaget's Stage 2 - Preoperational (2-7): egocentrism, animism, no conservation","Piaget's Stage 3 - Concrete Operational (7-11): conservation, reversibility, classification","Piaget's Stage 4 - Formal Operational (11+): abstract reasoning, hypothetical thinking","Vygotsky's ZPD: gap between what child can do alone vs with guidance (scaffolding)"],deepDive:"Piaget's concepts: Schema = cognitive framework. Assimilation = fitting new info into existing schema. Accommodation = changing schema to fit new info. Equilibration = balance between assimilation and accommodation.\n\nConservation (Concrete Operational): understanding that quantity doesn't change with appearance changes. Includes conservation of number, volume, mass, length. Classic test: equal amounts of water in different shaped glasses.\n\nVygotsky vs Piaget: Piaget = cognitive development drives language. Vygotsky = language drives cognitive development. ZPD = distance between actual developmental level and potential with guidance. More Interactionist approach than Piaget.\n\nInformation processing theory: parallel to computer — input, processing, output. Working memory = 7 +/- 2 items (Miller). Long-term memory is (theoretically) unlimited. Attention is a limited resource.",clinicalRelevance:"Developmental delays in Piagetian milestones may signal intellectual disability. Theory of mind (typically develops ~4 years) is impaired in autism spectrum disorder. Vygotsky's ZPD informs special education approaches.",memorize:["Sensory(0-2), Pre-op(2-7), Concrete(7-11), Formal(11+)","Conservation develops in Concrete Operational stage (7-11) NOT before","Vygotsky: ZPD + scaffolding. Language drives thought (opposite of Piaget)"]},
"ps_11": {keyPoints:["Encoding: converting information into a memory trace (visual, acoustic, semantic)","Storage: short-term/working memory (7+/-2 items, ~30 sec) and long-term (unlimited)","Retrieval: recall (no cues) vs recognition (cues present). Context-dependent memory","Declarative (explicit): episodic (autobiographical) + semantic (facts). Requires hippocampus","Procedural (implicit): skills, habits, conditioning. Does NOT require hippocampus"],deepDive:"Memory model: Sensory memory (iconic/echoic, fraction of a second) → Working memory (STM, ~30 sec, limited capacity) → Long-term memory (unlimited, relatively permanent).\n\nForgetting: Decay theory (trace fades with time). Interference theory: proactive interference (old memories interfere with new) and retroactive interference (new interferes with old). Memory consolidation occurs during sleep (HM case: anterograde amnesia after hippocampus removal).\n\nEncoding specificity principle: memory retrieval is best when conditions match encoding conditions. State-dependent memory: recall better in same physiological state as encoding. Mood-congruent memory: better recall of information matching current mood.",clinicalRelevance:"H.M. (Henry Molaison): hippocampus removal → anterograde amnesia but retained procedural memory. Alzheimer's: hippocampus affected early. PTSD: intrusive memories. Korsakoff syndrome (B1 deficiency): confabulation and anterograde amnesia. Memory reconsolidation has implications for PTSD treatment.",memorize:["Declarative (explicit) = episodic + semantic. Requires hippocampus","Procedural (implicit) = skills, habits. Does NOT require hippocampus","Proactive interference: OLD blocks NEW. Retroactive: NEW blocks OLD"]},
"ps_19": {keyPoints:["Psychoanalytic (Freud): id (pleasure), ego (reality), superego (moral). Unconscious motivation","Humanistic (Maslow, Rogers): self-actualization, unconditional positive regard, peak experiences","Trait theory (Big Five OCEAN): Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism","Social-cognitive (Bandura): behavior shaped by environment, cognition, and person (reciprocal determinism)","Self-concept vs self-esteem: what you believe about yourself vs how you value yourself"],deepDive:"Freud's structure: Id = unconscious, pleasure principle (immediate gratification). Ego = preconscious, reality principle (mediates between id and superego). Superego = conscious and unconscious, internalized social standards.\n\nFreud's defense mechanisms (reduce anxiety): Repression (burying thoughts), Projection (attributing own feelings to others), Rationalization (logical excuses), Displacement (redirecting emotions), Reaction formation (acting opposite to feelings), Sublimation (channeling into socially acceptable behavior).\n\nBig Five (OCEAN) is most empirically supported model. Relatively stable across lifespan. Extraversion most heritable. Agreeableness and Conscientiousness best predict job performance. Neuroticism predicts mental health outcomes.",clinicalRelevance:"Personality disorders (DSM-5): Cluster A (odd: paranoid, schizoid, schizotypal), Cluster B (dramatic: antisocial, borderline, histrionic, narcissistic), Cluster C (anxious: avoidant, dependent, OCD). Psychological assessment uses structured interviews and validated scales.",memorize:["Big Five OCEAN: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism","Freud: Id (pleasure) + Ego (reality) + Superego (moral). All interact for behavior","Bandura: reciprocal determinism (person x behavior x environment, all influence each other)"]},
"ps_20": {keyPoints:["Biomedical model: disease is biological. Biopsychosocial model: biological + psychological + social","DSM-5 categorizes mental disorders. Based on symptom criteria, not etiology","Major depressive disorder: depressed mood + 5 criteria for 2+ weeks (SIG E CAPS)","Schizophrenia: positive symptoms (hallucinations, delusions) + negative (flat affect, alogia)","Anxiety disorders: GAD, panic disorder, phobias, social anxiety, OCD, PTSD (trauma-related)"],deepDive:"Mood disorders: Major depression (MDD), Persistent depressive disorder (dysthymia), Bipolar I (manic + depressive), Bipolar II (hypomanic + depressive). Neurobiology: monoamine hypothesis (serotonin, norepinephrine, dopamine).\n\nSchizophrenia: positive symptoms (hallucinations, delusions, disorganized speech/behavior) vs negative (flat affect, alogia, avolition). Dopamine hypothesis: excess dopamine activity. Antipsychotics block D2 receptors.\n\nNeurodevelopmental disorders: ADHD (inattention, hyperactivity, impulsivity), Autism spectrum disorder (social communication deficits, restricted/repetitive behaviors). Neurocognitive disorders: Alzheimer's (most common dementia, amyloid plaques, neurofibrillary tangles).",clinicalRelevance:"SIG E CAPS mnemonic for MDD: Sleep (changes), Interest (decreased), Guilt, Energy (decreased), Concentration, Appetite, Psychomotor changes, Suicidal ideation. Requires 5+ symptoms for 2+ weeks including depressed mood or anhedonia.",memorize:["SIG E CAPS for depression symptoms (5+ for 2 weeks)","Schizophrenia: positive = excess (hallucinations, delusions). Negative = deficit (flat affect, alogia)","Biopsychosocial model considers biological, psychological, AND social factors"]},
"ps_31": {keyPoints:["Classical conditioning (Pavlov): neutral stimulus paired with UCS becomes CS that elicits CR","Operant conditioning (Skinner): behavior shaped by consequences","Positive reinforcement: add reward. Negative reinforcement: remove aversive. Both INCREASE behavior","Punishment DECREASES behavior. Positive = add aversive. Negative = remove reward","Variable ratio schedule: most resistant to extinction (slot machine effect)"],deepDive:"Classical conditioning key terms: UCS (unconditioned stimulus) → UCR (unconditioned response). NS (neutral stimulus) paired with UCS → CS (conditioned stimulus) → CR (conditioned response). Extinction: CS presented repeatedly without UCS. Spontaneous recovery: extinguished response returns after rest. Generalization: similar stimuli produce CR. Discrimination: only specific CS produces CR.\n\nOperant conditioning reinforcement schedules: Fixed ratio (FR): every nth response rewarded — high rate with brief pauses. Variable ratio (VR): unpredictable number — highest rates, most extinction resistant. Fixed interval (FI): first response after set time — scallop pattern. Variable interval (VI): unpredictable timing — moderate, steady rates.\n\nToken economies use operant principles in clinical settings. Behavior modification therapy. Shaping: reinforcing successive approximations of target behavior.",clinicalRelevance:"Behavioral therapy uses operant conditioning principles. Exposure therapy = extinction of conditioned fear. Systematic desensitization for phobias. Applied behavior analysis (ABA) for autism. Addiction: drug use = operant (negative reinforcement by removing withdrawal symptoms).",memorize:["Negative reinforcement INCREASES behavior (it removes something bad)","VR schedule = most resistant to extinction. Continuous reinforcement = fastest extinction","Classical: involuntary responses. Operant: voluntary behaviors. Both involve learning"]},
"ps_35": {keyPoints:["Erikson's 8 stages: each has a central conflict that must be resolved for healthy development","Stage 5 (12-18): Identity vs Role Confusion — crucial for adolescence","Stage 6 (18-40): Intimacy vs Isolation — most tested stage for young adults","Looking-glass self (Cooley): self-concept shaped by how we imagine others see us","Reference groups: groups we compare ourselves to for self-evaluation"],deepDive:"All 8 Erikson stages: 1.Trust vs Mistrust (0-1), 2.Autonomy vs Shame (1-3), 3.Initiative vs Guilt (3-6), 4.Industry vs Inferiority (6-12), 5.Identity vs Role Confusion (12-18), 6.Intimacy vs Isolation (18-40), 7.Generativity vs Stagnation (40-65), 8.Integrity vs Despair (65+).\n\nIdentity formation: Marcia's identity statuses (based on Erikson): Identity diffusion (no exploration or commitment), Foreclosure (commitment without exploration), Moratorium (exploring without commitment), Identity achievement (exploration AND commitment — healthiest).\n\nSelf-concept development: Social comparison theory (Festinger) — we evaluate ourselves by comparing to others. Upward comparison (with better-off) → motivation or distress. Downward comparison (with worse-off) → self-esteem boost.",clinicalRelevance:"Adolescent identity development is vulnerable to disruption by trauma, abuse, or instability. Failure to resolve Erikson's stages may contribute to personality disorders. Identity crises are normal developmental phenomena. Cultural identity is increasingly recognized as important.",memorize:["Erikson Stage 6: Intimacy vs Isolation (18-40). Most tested on MCAT","Identity vs Role Confusion = adolescence (12-18). Identity crisis is normal","Looking-glass self: we see ourselves through others' eyes (Cooley)"]},
"ps_38": {keyPoints:["Stereotype: cognitive generalization about group members","Prejudice: affective (emotional) attitude based on group membership","Discrimination: differential treatment based on group membership","In-group bias: favoring one's own group. Out-group homogeneity: seeing out-group as all alike","Implicit bias: unconscious attitudes affecting judgment and behavior"],deepDive:"Sources of prejudice: realistic conflict theory (competition for limited resources), social identity theory (Tajfel: in-group favoritism to boost self-esteem), authoritarian personality.\n\nReducing prejudice: contact hypothesis (Allport): contact under equal status, cooperative goals, institutional support reduces prejudice. Superordinate goals bring groups together (Sherif's Robbers Cave experiment).\n\nStereotype threat (Steele): awareness of negative stereotype about one's group impairs performance. Self-fulfilling prophecy: expectations influence behavior in ways that confirm expectations. Confirmation bias: tendency to seek info that confirms existing beliefs.",clinicalRelevance:"Implicit bias in healthcare leads to disparities in pain management, diagnosis, and treatment across race, gender, and socioeconomic status. Cultural competency training aims to reduce impact of implicit bias. Stereotype threat affects minority student academic performance.",memorize:["Stereotype = cognitive. Prejudice = affective (emotional). Discrimination = behavioral","In-group bias = favoring own group. Out-group homogeneity = seeing them as all alike","Stereotype threat: performance impaired by awareness of negative group stereotype"]},
"ps_42": {keyPoints:["Asch conformity experiments: 75% conformed to wrong group answer at least once","Milgram obedience study: 65% delivered maximum shock when ordered by authority figure","Bystander effect: less likely to help when others are present (diffusion of responsibility)","Pluralistic ignorance: everyone privately disagrees but assumes others agree","Social loafing: individuals exert less effort in groups than alone"],deepDive:"Factors affecting conformity (Asch): group size (up to ~5 increases conformity), unanimity (one ally dramatically reduces conformity), group cohesion, ambiguity of task.\n\nFactors affecting obedience (Milgram): authority figure present, legitimate authority (lab coat), proximity to victim (obedience decreased when visible), no escape from situation.\n\nSocial influence types: informational (accepting others' opinions as correct, especially in ambiguous situations) vs normative (conforming to gain approval, even when you disagree). Minority influence: consistent, confident minority can shift majority opinion over time (Moscovici).",clinicalRelevance:"Healthcare settings: authority dynamics can impair communication (nurses afraid to question doctors). Bystander effect in emergency situations. Group decision-making susceptible to groupthink. Understanding social influence important for public health messaging and behavior change.",memorize:["Asch: conformity to obviously wrong group answer (75% at least once)","Milgram: 65% delivered max shock when ordered to. Obedience to authority","Bystander effect = diffusion of responsibility. More bystanders = less help"]},
"cars_0": {keyPoints:["Main idea = what the passage is fundamentally about (not just the topic)","Author's purpose = why the author wrote this (to argue, analyze, critique, describe, explain)","Tone = author's attitude toward subject (skeptical, optimistic, nostalgic, ironic, cautious)","Central claim = the specific position the author defends","Support = evidence, examples, or reasoning the author uses to back the claim"],deepDive:"Reading strategy: Before reading, note the source/category (humanities, social science, natural science). During reading: identify each paragraph's function. First paragraph usually introduces the topic and often states the thesis. Last paragraph often restates the conclusion.\n\nMain idea question approach: Wrong answers are too narrow (just one paragraph's point), too broad (general topic not specific argument), or distorted (misrepresent author's position).\n\nParagraph purpose: Some paragraphs introduce a problem, some provide evidence, some introduce a counterargument (followed by rebuttal). Understanding structure helps predict what will come and find information efficiently.",clinicalRelevance:"CARS score is the most predictive of success in medical school interviews and communication skills. These reading skills directly translate to interpreting medical literature, patient charts, and clinical guidelines.",memorize:["Main idea = author's ARGUMENT, not just the topic","Tone words: skeptical, cautious, optimistic, ironic, nostalgic, polemical, ambivalent","Wrong CARS answers are: too narrow, too broad, extreme, opposite, or out of scope"]},
"cars_1": {keyPoints:["Inference = what MUST be true based on the passage (not just what could be true)","Assumptions = unstated premises the argument requires to be true","Strengthen: new info that makes the author's conclusion more convincing","Weaken: info that undermines a premise or breaks the conclusion's logical chain","Never go beyond the passage — right answers are always grounded in text evidence"],deepDive:"Inference question approach: Find the relevant passage section. Identify what the author implies. The correct answer is the one that MUST be true — not just probably true. Eliminate answers that: (1) go beyond the passage, (2) contradict the passage, (3) are only plausible but not required.\n\nStrength of evidence: direct statements vs implications vs extrapolations. Authors may qualify statements ('may,' 'might,' 'suggests') — CARS answers must respect these qualifiers.\n\nArgument structure: Identify premises (supporting reasons) and conclusion (main claim). Logical gap = what must be assumed for premises to support conclusion. Assumptions questions ask you to identify this gap.",clinicalRelevance:"Clinical reasoning requires the same inference skills: What MUST be true about a patient given the symptoms? What additional information is needed? Evidence-based medicine requires distinguishing what studies actually show vs what we wish they showed.",memorize:["Inference = what MUST be true from passage. Must = stronger than could or might","Assumptions = unstated but necessary premises. Bridge between evidence and conclusion","Strengthen/weaken: understand the argument's logical structure first, then evaluate new info"]},
"cars_2": {keyPoints:["Application questions ask: given new situation, what would the author say/do?","New information questions: how does this new fact affect the argument?","Analogy questions: which situation is most similar to what described in the passage?","Extrapolation: extending the author's logic to a new but related case","Author's likely response: author would agree/disagree/find most consistent with","Always bring it back to the passage — author's actual stated views"],deepDive:"Application question approach: First, identify the author's central argument and key assumptions. Then apply that logic to the new scenario. Do not let personal knowledge override what the author says — only the passage matters.\n\nNew information: Does the new fact support, undermine, or is neutral to the argument? Find the specific part of the argument it affects. New facts can also change what we'd expect the author to conclude.\n\nAnalogy questions: Look for structural similarity (same logical relationship), not just surface similarity (same topic). The analogy should preserve the relationship between key elements described in the passage.",clinicalRelevance:"Clinical reasoning often requires applying known principles to new situations (applying pharmacological mechanisms to predict drug interactions, applying diagnostic criteria to novel presentations). This parallels CARS reasoning beyond the text.",memorize:["Application: apply author's logic to new situation using ONLY what passage states","New info: identify which specific part of the argument is affected","Analogy: look for structural similarity (same logical relationship), not just same topic"]},
};

// ─── FLASHCARDS (pre-built, 50 cards) ─────────────────────────────────────────
var FLASHCARDS = {
bb:[
  {q:"What are the 4 levels of protein structure?",a:"1° = amino acid sequence (covalent peptide bonds). 2° = alpha helices and beta sheets (hydrogen bonds). 3° = overall 3D folding (disulfide, hydrophobic, ionic, H-bonds). 4° = multiple polypeptide chains interacting.",cat:"Proteins"},
  {q:"What is the Michaelis-Menten equation and what does Km mean?",a:"v = Vmax[S]/(Km+[S]). Km = [S] at half-maximal velocity. LOW Km = HIGH affinity. HIGH Km = LOW affinity.",cat:"Enzymes"},
  {q:"Competitive vs Non-competitive inhibition",a:"Competitive: binds active site, raises Km, same Vmax, overcome with more substrate. Non-competitive: binds allosteric site, same Km, lowers Vmax, cannot overcome.",cat:"Enzymes"},
  {q:"Central dogma + reverse transcriptase",a:"DNA → (transcription) → mRNA → (translation) → Protein. Retroviruses use reverse transcriptase (RNA → DNA). DNA replication copies DNA.",cat:"Genetics"},
  {q:"Steps and products of glycolysis",a:"Glucose → 2 pyruvate. Net: 2 ATP, 2 NADH. Cytoplasm. Anaerobic. PFK-1 is rate-limiting enzyme. Investment phase: 2 ATP used. Payoff phase: 4 ATP produced.",cat:"Metabolism"},
  {q:"ATP yield from aerobic respiration",a:"Total ~30-32 ATP per glucose. Glycolysis: 2. Krebs (x2): 2. ETC: ~26-28. NADH = ~2.5 ATP each. FADH2 = ~1.5 ATP each.",cat:"Metabolism"},
  {q:"Mitosis vs Meiosis",a:"Mitosis: 1 diploid → 2 diploid daughter cells. Somatic. No crossing over. Meiosis: 1 diploid → 4 haploid cells. Gametes. Crossing over in Prophase I.",cat:"Cell Division"},
  {q:"Lac operon: when is it ON vs OFF?",a:"OFF: no lactose present (repressor binds operator, blocks transcription). ON: lactose present (allolactose inhibits repressor). Also needs low glucose (CAP-cAMP activates).",cat:"Gene Regulation"},
  {q:"Products of the Krebs cycle per turn",a:"Per acetyl-CoA: 3 NADH, 1 FADH2, 1 GTP, 2 CO2. Runs twice per glucose (2 acetyl-CoA). Total: 6 NADH, 2 FADH2, 2 GTP.",cat:"Metabolism"},
  {q:"Rough ER vs Smooth ER",a:"Rough ER: has ribosomes → makes secretory and membrane proteins. Smooth ER: no ribosomes → lipid synthesis, steroid hormones, detoxification, Ca2+ storage.",cat:"Cell Biology"},
  {q:"Hardy-Weinberg equilibrium",a:"p² + 2pq + q² = 1 (genotype frequencies). p + q = 1 (allele frequencies). Requires: large population, random mating, no mutation, migration, or natural selection.",cat:"Evolution"},
  {q:"DNA replication key enzymes",a:"Helicase: unwinds DNA. SSBPs: stabilize strands. Primase: makes RNA primer. DNA Pol III: extends (5'→3'). DNA Pol I: removes primer. Ligase: seals nicks.",cat:"DNA Replication"},
  {q:"Non-disjunction outcomes",a:"In Meiosis I: ALL 4 gametes abnormal. In Meiosis II: 2 abnormal, 2 normal. Trisomy 21 = Down syndrome. 45,X = Turner syndrome. 47,XXY = Klinefelter.",cat:"Cell Division"},
  {q:"Types of gene mutations",a:"Silent: same amino acid. Missense: different amino acid. Nonsense: premature stop codon. Frameshift: insertion/deletion shifts reading frame → garbled downstream sequence.",cat:"Genetics"},
  {q:"Na+/K+ ATPase: what does it do?",a:"Pumps 3 Na+ OUT and 2 K+ IN per ATP hydrolyzed. Maintains resting membrane potential (-70 mV). Creates concentration gradients used for secondary active transport.",cat:"Cell Biology"},
],
cp:[
  {q:"Ohm's Law and resistor rules",a:"V = IR. Series: R_total = R1+R2 (same current). Parallel: 1/R = 1/R1+1/R2 (same voltage). Power: P = IV = I²R = V²/R.",cat:"Circuits"},
  {q:"Bernoulli's principle",a:"P + ½ρv² + ρgh = constant. Higher velocity → lower pressure. Explains lift, stenosis (blood flow), atomizers. Continuity: A1v1 = A2v2 (flow conservation).",cat:"Fluids"},
  {q:"Ideal Gas Law and its derivatives",a:"PV = nRT. Boyle: P1V1 = P2V2 (constant T). Charles: V1/T1 = V2/T2 (constant P). Combined: P1V1/T1 = P2V2/T2. T must be in Kelvin.",cat:"Gases"},
  {q:"Henderson-Hasselbalch equation",a:"pH = pKa + log([A-]/[HA]). Buffer most effective at pH = pKa ± 1. At half-equivalence point: pH = pKa. Use to find pKa from titration curve.",cat:"Acid-Base"},
  {q:"Laws of thermodynamics",a:"1st: ΔU = q + w (energy conserved). 2nd: entropy of universe always increases. 3rd: entropy = 0 at absolute zero. ΔG = ΔH - TΔS. ΔG < 0 = spontaneous.",cat:"Thermodynamics"},
  {q:"Coulomb's Law",a:"F = kq1q2/r². k = 9×10⁹ N·m²/C². Electric field E = kQ/r². Potential V = kQ/r. Like charges repel, opposite attract.",cat:"Electrostatics"},
  {q:"Le Chatelier's principle",a:"Stress on equilibrium system shifts it to relieve stress. Add reactant → shift right. Remove product → shift right. Increase pressure → shift toward fewer moles of gas. Increase T → shift toward endothermic side.",cat:"Equilibrium"},
  {q:"SN1 vs SN2 reactions",a:"SN1: 2 steps, carbocation intermediate, racemization, favored by 3° substrate + polar protic solvent. SN2: 1 step, backside attack, inversion, 1° substrate + polar aprotic solvent.",cat:"Organic Chemistry"},
  {q:"Strong acids to memorize",a:"HCl, HBr, HI, HNO3, H2SO4, HClO4. These 6 fully dissociate. [H+] = [acid] for strong acids only. All others are weak acids.",cat:"Acid-Base"},
  {q:"Newton's Laws and kinematics",a:"F = ma. KE = ½mv². PE = mgh. Conservation of energy: KE + PE = constant (no friction). Momentum: p = mv. Impulse = Δp = FΔt.",cat:"Physics"},
  {q:"Electrochemistry fundamentals",a:"Anode = oxidation (loses electrons, negative terminal in galvanic). Cathode = reduction (gains electrons, positive terminal). E°cell = E°cathode - E°anode. Positive = spontaneous. ΔG° = -nFE°.",cat:"Electrochemistry"},
  {q:"Hybridization and geometry",a:"sp3: tetrahedral, 109.5° (4 bonds, 0 lone pairs). sp2: trigonal planar, 120° (double bond). sp: linear, 180° (triple bond). Lone pairs compress bond angles.",cat:"Bonding"},
  {q:"Radioactive decay types",a:"Alpha (α): loses 2p+2n (He-4 nucleus), low penetration. Beta (β-): neutron → proton + electron. Gamma (γ): photon, highest energy/penetration. Half-life: t½ = 0.693/λ.",cat:"Nuclear"},
  {q:"Properties of water (high-yield)",a:"High specific heat (absorbs heat, stabilizes temperature). High heat of vaporization. Cohesion (H-bonds between water) and adhesion. Ice less dense than liquid (H-bond lattice). Amphoteric acid and base.",cat:"Chemistry"},
  {q:"Types of intermolecular forces",a:"Strongest to weakest: H-bond (N-H, O-H, F-H...N/O/F) > Dipole-dipole > London dispersion (van der Waals, all molecules, based on size). Higher forces → higher BP, lower vapor pressure.",cat:"Bonding"},
],
ps:[
  {q:"Erikson's 8 stages of psychosocial development",a:"1.Trust(0-1) 2.Autonomy(1-3) 3.Initiative(3-6) 4.Industry(6-12) 5.Identity(12-18) 6.Intimacy(18-40) 7.Generativity(40-65) 8.Integrity(65+). Each involves a conflict to resolve.",cat:"Development"},
  {q:"Piaget's 4 stages of cognitive development",a:"1.Sensorimotor(0-2): object permanence. 2.Preoperational(2-7): egocentric, no conservation. 3.Concrete(7-11): conservation, logical. 4.Formal(11+): abstract, hypothetical.",cat:"Development"},
  {q:"Classical conditioning: key terms",a:"UCS → UCR (natural). NS paired with UCS → CS → CR. Extinction: CS without UCS. Spontaneous recovery: extinguished CR returns after rest. Generalization: similar CS works. Discrimination: only original CS works.",cat:"Learning"},
  {q:"Operant conditioning: reinforcement schedules",a:"Fixed Ratio (FR): every nth response, high rate, brief pause after reward. Variable Ratio (VR): unpredictable, highest rates, most extinction resistant. Fixed Interval (FI): scallop pattern. Variable Interval (VI): steady moderate rate.",cat:"Learning"},
  {q:"Memory types: declarative vs procedural",a:"Declarative (explicit): requires hippocampus. Episodic = personal events. Semantic = facts/general knowledge. Procedural (implicit): skills, habits, conditioning. Does NOT require hippocampus. H.M. retained procedural, lost declarative.",cat:"Memory"},
  {q:"Bystander effect and diffusion of responsibility",a:"Bystander effect: less likely to help as group size increases. Diffusion of responsibility: each person assumes someone else will act. Pluralistic ignorance: each assumes others are comfortable with a situation.",cat:"Social Psychology"},
  {q:"Defense mechanisms (Freud)",a:"Repression (bury thoughts), Projection (attribute to others), Rationalization (logical excuse), Displacement (redirect to safer target), Reaction formation (act opposite), Sublimation (channel into productive behavior).",cat:"Personality"},
  {q:"Cognitive dissonance",a:"Festinger. Discomfort from holding conflicting beliefs or acting against values. Reduce by: (1) changing belief, (2) changing behavior, (3) adding consonant cognitions. Example: smoker who knows risks.",cat:"Attitudes"},
  {q:"Major neurotransmitters and functions",a:"Dopamine: reward, movement (Parkinson's). Serotonin: mood, sleep (depression). GABA: inhibitory (anxiety). Glutamate: excitatory (LTP, memory). ACh: muscle/memory (Alzheimer's). NE: fight-or-flight.",cat:"Neuroscience"},
  {q:"Bandura's social learning theory",a:"Bobo doll experiment: children imitate aggressive behavior. Four processes: attention, retention, reproduction, motivation. Vicarious reinforcement. Self-efficacy = belief in ability to succeed. Reciprocal determinism.",cat:"Learning"},
  {q:"Big Five personality traits (OCEAN)",a:"Openness (creativity, curiosity), Conscientiousness (organization, discipline), Extraversion (sociability, assertiveness), Agreeableness (cooperation, empathy), Neuroticism (emotional instability, anxiety). Most empirically supported model.",cat:"Personality"},
  {q:"Theories of emotion",a:"James-Lange: physiological arousal THEN emotion. Cannon-Bard: arousal and emotion SIMULTANEOUSLY. Schachter-Singer (two-factor): arousal + cognitive label = emotion. Lazarus: cognitive appraisal FIRST, then arousal.",cat:"Emotion"},
  {q:"Social stratification and mobility",a:"Stratification: hierarchical ranking by wealth, power, prestige. Caste (closed, ascribed) vs class (open, achieved). Vertical mobility (up/down status). Horizontal (same level). Meritocracy ideology. Bourdieu: cultural and social capital.",cat:"Sociology"},
  {q:"Attribution theory",a:"Fundamental attribution error: overestimate dispositional (person) causes, underestimate situational causes. Actor-observer bias. Self-serving bias: success = internal, failure = external. Ultimate attribution error (groups).",cat:"Social Psychology"},
  {q:"Vygotsky's Zone of Proximal Development",a:"ZPD = range between what child can do alone vs with expert guidance. Scaffolding = temporary support to reach next level. More-knowledgeable other (MKO) provides support. Language drives cognitive development (opposite of Piaget).",cat:"Development"},
],
cars:[
  {q:"How to find the main idea of a CARS passage",a:"Main idea = author's ARGUMENT (not just topic). Usually in first or last paragraph. Ask: What claim is the author defending? Wrong answers are too narrow (one paragraph), too broad (just the topic), or distorted.",cat:"Strategy"},
  {q:"What is an inference question?",a:"Asks what MUST be true based on the passage (even if not stated). Right answer: supported by text evidence, logically required. Wrong answers: go beyond the passage, contradict text, are merely possible but not required.",cat:"Reasoning"},
  {q:"Strengthen vs weaken questions",a:"Strengthen: new info makes author's conclusion more convincing (supports a premise or closes a logical gap). Weaken: undermines a premise or shows conclusion doesn't follow. Always understand the argument structure first.",cat:"Reasoning"},
  {q:"Common wrong answer types in CARS",a:"Out of scope (beyond passage), Extreme (too absolute — 'always,' 'never,' 'all'), Opposite (says reverse of passage), Distortion (misrepresents), Half-right/half-wrong (first part correct, second wrong).",cat:"Strategy"},
  {q:"How to identify author's tone",a:"Look for value-laden words: criticizes, argues, dismisses, praises, laments, challenges. Describe tone as: objective, skeptical, optimistic, cynical, nostalgic, ironic, cautious, polemical, ambivalent. Tone affects all question types.",cat:"Reading"},
],
};

// ─── QUIZ BANK (pre-built questions) ─────────────────────────────────────────
var QUIZBANK = {
bb:[
  {q:"An enzyme has Km = 2 mM and Vmax = 100 μmol/min. What is the rate at [S] = 2 mM?",choices:{A:"25 μmol/min",B:"50 μmol/min",C:"75 μmol/min",D:"100 μmol/min"},correct:"B",exp:"At [S] = Km, v = Vmax/2 = 50. This is the definition of Km."},
  {q:"Which bond is broken during hydrolysis of a peptide?",choices:{A:"Disulfide bond",B:"Hydrogen bond",C:"Peptide (amide) bond",D:"Ionic bond"},correct:"C",exp:"Peptide bonds are amide bonds (-CO-NH-) linking amino acids. Hydrolysis adds water to break them back into amino acids."},
  {q:"In which phase of cellular respiration is the most ATP produced?",choices:{A:"Glycolysis",B:"Pyruvate decarboxylation",C:"Krebs cycle",D:"Oxidative phosphorylation"},correct:"D",exp:"The electron transport chain produces ~26-28 ATP via chemiosmosis, far more than any other phase."},
  {q:"A codon changes from UAU to UAA. What type of mutation is this?",choices:{A:"Conservative substitution",B:"Missense mutation",C:"Silent mutation",D:"Nonsense mutation"},correct:"D",exp:"UAA is a stop codon. Converting an amino acid codon to a stop codon is a nonsense mutation, causing premature protein termination."},
  {q:"Non-competitive inhibition differs from competitive inhibition in that it:",choices:{A:"Increases Km","B":"Can be overcome with excess substrate","C":"Decreases Vmax","D":"Binds the active site"},correct:"C",exp:"Non-competitive inhibitors bind allosteric sites and decrease Vmax. They don't change Km (the active site is unaffected). Cannot overcome with more substrate."},
  {q:"Which organelle modifies and packages proteins for secretion?",choices:{A:"Rough ER",B:"Smooth ER",C:"Golgi apparatus",D:"Lysosome"},correct:"C",exp:"The Golgi apparatus receives proteins from the rough ER, modifies them (glycosylation, cleavage), and packages into vesicles for secretion."},
  {q:"A cell in G2 has 46 chromosomes. How many chromosomes will each daughter cell have after mitosis?",choices:{A:"23",B:"46",C:"92",D:"Cannot be determined"},correct:"B",exp:"Mitosis produces two identical diploid daughter cells. Each receives 46 chromosomes — same as parent."},
  {q:"Which process is exclusively anaerobic?",choices:{A:"Oxidative phosphorylation",B:"Krebs cycle",C:"Lactic acid fermentation",D:"Beta oxidation"},correct:"C",exp:"Lactic acid fermentation regenerates NAD+ without using oxygen. Glycolysis is anaerobic but fermentation is exclusively so. ETC and Krebs cycle require mitochondria/oxygen indirectly."},
],
cp:[
  {q:"A solution has [H+] = 1×10⁻⁹ M. What is the pH?",choices:{A:"5, acidic",B:"9, basic",C:"9, acidic",D:"5, basic"},correct:"B",exp:"pH = -log(10⁻⁹) = 9. pH > 7 = basic/alkaline."},
  {q:"A gas occupies 4 L at 2 atm. What volume at 1 atm (constant temperature)?",choices:{A:"2 L",B:"4 L",C:"6 L",D:"8 L"},correct:"D",exp:"Boyle's Law: P1V1 = P2V2. (2)(4) = (1)(V2). V2 = 8 L. Pressure and volume are inversely proportional at constant T."},
  {q:"Which electrode undergoes oxidation in a galvanic cell?",choices:{A:"Cathode",B:"Anode",C:"Salt bridge",D:"Both equally"},correct:"B",exp:"Anode = oxidation (loses electrons). Cathode = reduction (gains electrons). Red Cat, An Ox."},
  {q:"A block slides down a frictionless incline of height 5m. Speed at bottom? (g = 10 m/s²)",choices:{A:"5 m/s",B:"10 m/s",C:"50 m/s",D:"100 m/s"},correct:"B",exp:"Energy conservation: mgh = ½mv². v = √(2gh) = √(100) = 10 m/s."},
  {q:"Which substance has the highest boiling point?",choices:{A:"CH4",B:"NH3",C:"H2O",D:"HF"},correct:"C",exp:"Water forms 4 hydrogen bonds per molecule, giving it the highest boiling point. NH3 and HF form fewer H-bonds."},
  {q:"Enantiomers are best described as:",choices:{A:"Same connectivity, same spatial arrangement",B:"Same connectivity, non-superimposable mirror images",C:"Different connectivity, same molecular formula",D:"Same molecular formula, different connectivity"},correct:"B",exp:"Enantiomers have the same connectivity but are non-superimposable mirror images (different configuration at chiral center). They rotate plane-polarized light in opposite directions."},
  {q:"Which reaction produces an ester?",choices:{A:"Aldol condensation",B:"Fischer esterification",C:"Diels-Alder reaction",D:"Wittig reaction"},correct:"B",exp:"Fischer esterification: alcohol + carboxylic acid → ester + water. Acid-catalyzed, reversible. Drive forward by removing water (Le Chatelier)."},
  {q:"If ΔH < 0 and ΔS < 0 for a reaction, when is it spontaneous?",choices:{A:"Always spontaneous",B:"Never spontaneous",C:"Spontaneous at low temperature",D:"Spontaneous at high temperature"},correct:"C",exp:"ΔG = ΔH - TΔS. When both are negative, ΔG = (-) - T(-) = (-) + (+). At low T, the ΔH term dominates → ΔG < 0 (spontaneous). At high T, the TΔS term dominates → ΔG > 0 (non-spontaneous)."},
],
ps:[
  {q:"A child cannot understand that flattening clay doesn't change its amount. What Piagetian stage?",choices:{A:"Sensorimotor",B:"Preoperational",C:"Concrete Operational",D:"Formal Operational"},correct:"B",exp:"Conservation develops in Concrete Operational (7-11). In Preoperational (2-7), children cannot conserve — they focus on appearances."},
  {q:"A rat receives food every 5th lever press. This reinforcement schedule is:",choices:{A:"Fixed interval",B:"Variable ratio",C:"Fixed ratio",D:"Continuous reinforcement"},correct:"C",exp:"Fixed ratio (FR5): reward after every 5th response. Produces high, steady rates with brief pauses after reinforcement."},
  {q:"Which theory states physiological arousal and emotional experience occur simultaneously?",choices:{A:"James-Lange",B:"Cannon-Bard",C:"Schachter-Singer",D:"Lazarus"},correct:"B",exp:"Cannon-Bard: arousal and emotion are simultaneous and independent. James-Lange: arousal first, then emotion. Schachter-Singer: arousal + cognitive label."},
  {q:"Front-row students get better grades, so sitting in front CAUSES better grades. The flaw is:",choices:{A:"Sampling bias",B:"Confirmation bias",C:"Confounding variable",D:"Ceiling effect"},correct:"C",exp:"Correlation does not imply causation. Motivation could cause both front-row sitting and better grades — a confounding variable. Need randomized design to establish causation."},
  {q:"According to Freud, which part of personality operates on the reality principle?",choices:{A:"Id",B:"Ego",C:"Superego",D:"Preconscious"},correct:"B",exp:"Ego operates on reality principle — mediates between the id's desires and real-world constraints. Id = pleasure principle. Superego = moral standards."},
  {q:"The looking-glass self concept states:",choices:{A:"We judge others by our own behavior",B:"Our self-concept is shaped by how we think others see us",C:"We copy behavior of admired others",D:"We remember positive events more clearly"},correct:"B",exp:"Cooley's looking-glass self: our self-concept develops from imagining how others perceive us and reacting to that imagined perception."},
  {q:"Which memory type stores autobiographical events?",choices:{A:"Semantic memory",B:"Procedural memory",C:"Episodic memory",D:"Priming"},correct:"C",exp:"Episodic memory = personal autobiographical events with time and place context. Semantic = facts. Procedural = skills. Both episodic and semantic are declarative (explicit)."},
  {q:"Which sociological perspective views society as a system of interrelated parts?",choices:{A:"Conflict theory",B:"Symbolic interactionism",C:"Functionalism",D:"Feminist theory"},correct:"C",exp:"Functionalism (Durkheim, Parsons): society is like an organism — each part serves a function that maintains social stability. Conflict theory focuses on power struggles. Symbolic interactionism on meaning."},
],
cars:[
  {q:"In CARS, an author who 'argues' a position most likely:",choices:{A:"Presents universally accepted facts",B:"Defends a debatable claim with support",C:"Writes a purely descriptive passage",D:"Expresses uncertainty about the topic"},correct:"B",exp:"'Argues' signals a debatable position being defended. MCAT CARS passages have authors taking positions. Look for thesis and supporting evidence."},
  {q:"Which answer type is most likely WRONG in CARS?",choices:{A:"Supported directly by a specific passage sentence",B:"A logical implication of the author's main argument",C:"True in the real world but not mentioned in the passage",D:"Consistent with the author's overall tone"},correct:"C",exp:"Real-world accuracy is irrelevant in CARS. Answers must be supported by the PASSAGE, not outside knowledge. This is the most common trap."},
  {q:"Author: 'While X has merit, it ultimately fails because Y.' The author's view of X is best described as:",choices:{A:"Complete rejection",B:"Unconditional support",C:"Qualified acknowledgment followed by criticism",D:"Neutral and objective"},correct:"C",exp:"'While X has merit' = acknowledging some value. 'ultimately fails' = the author's actual critical position. This is a common CARS rhetorical structure."},
],
};

// ─── CARS PASSAGES ───────────────────────────────────────────────────────────
var CARS_PASSAGES = [
{id:"p1",title:"The Paradox of Choice",cat:"Social Sciences",
text:"The modern consumer faces an unprecedented abundance of options. Where previous generations might have chosen from three or four varieties of a product, today's shopper confronts dozens. Psychologist Barry Schwartz argues that this proliferation of choice, far from liberating individuals, actually produces a kind of paralysis and dissatisfaction. When options are limited, people make decisions and move on. When options are vast, the decision itself becomes a burden — each unchosen alternative represents a potential loss.\n\nSchwartz distinguishes between 'maximizers,' who seek the best possible option, and 'satisficers,' who seek an option that is good enough. Maximizers are particularly vulnerable to choice overload: the more options available, the more exhausted and regretful they become, because there is always a chance that a better option was passed over. Satisficers, by contrast, set a threshold of acceptability and stop searching once they find something that meets it.\n\nCritics of Schwartz's framework point out that his studies were conducted primarily in wealthy, Western contexts. In societies where choices have historically been constrained by poverty, discrimination, or political control, the expansion of choice is unambiguously positive. The right to choose has been a cornerstone of liberal political philosophy precisely because its absence is experienced as deprivation. To characterize choice itself as problematic may reflect the assumptions of a particular privileged vantage point.",
questions:[
  {q:"The primary purpose of this passage is to:",choices:{A:"Argue that consumers should have fewer options",B:"Present and qualify a theory about choice and well-being",C:"Criticize the methodology of Schwartz's research",D:"Defend liberal political philosophy"},correct:"B",exp:"The passage presents Schwartz's theory then qualifies it with cultural criticism. It neither fully endorses nor fully rejects — it presents and qualifies."},
  {q:"According to the passage, maximizers differ from satisficers primarily in that maximizers:",choices:{A:"Are less educated about their options",B:"Live in wealthier societies",C:"Continue searching for a better option even after finding acceptable ones",D:"Are more easily satisfied with limited choices"},correct:"C",exp:"Maximizers 'seek the best possible option' and become regretful wondering if better exists. Satisficers stop once good enough is found."},
  {q:"The critics in the final paragraph would most likely agree that:",choices:{A:"Schwartz's framework applies universally",B:"Maximizers are psychologically healthier than satisficers",C:"The value of choice cannot be evaluated without considering context",D:"Consumer choice should be limited by government"},correct:"C",exp:"Critics argue Schwartz's Western-wealthy context limits applicability. In other contexts, expanded choice is 'unambiguously positive.' They emphasize context-dependence."},
]},
{id:"p2",title:"Science and the Limits of Objectivity",cat:"Philosophy of Science",
text:"The image of the scientist as a dispassionate observer, neutrally recording facts about a value-free world, has been challenged from multiple directions. Thomas Kuhn argued that science progresses not through simple accumulation of facts but through 'paradigm shifts' — wholesale transformations of the conceptual frameworks within which scientists interpret evidence. What counts as a fact, what counts as an anomaly, and what counts as a solution all depend on the reigning paradigm.\n\nFeminist philosophers of science pushed this critique further. They argued that the values embedded in scientific practice — what questions are asked, how studies are designed, whose experiences count as data — are not neutral but reflect the social positions and interests of those who dominated scientific institutions. The exclusion of women and minorities from scientific research was not merely a social injustice; it was an epistemic one, distorting the knowledge produced.\n\nYet this does not mean that all scientific claims are equally valid or that objectivity is impossible. Many philosophers argue for a 'situated' objectivity — one that acknowledges the perspective of the knower while maintaining rigorous standards of evidence. The goal is not to eliminate perspective but to be transparent about it, and to ensure that diverse perspectives are included in knowledge production.",
questions:[
  {q:"Kuhn's central claim, as presented in this passage, is that:",choices:{A:"Scientific facts are entirely subjective",B:"Scientific progress requires diverse researchers",C:"Scientific interpretation depends on accepted frameworks",D:"The scientific method is fundamentally flawed"},correct:"C",exp:"Kuhn argues what counts as fact or anomaly depends on the 'reigning paradigm.' This is about conceptual frameworks shaping interpretation."},
  {q:"The feminist critique adds to Kuhn's argument by:",choices:{A:"Rejecting scientific objectivity entirely",B:"Extending the critique to include social identity and power",C:"Arguing women are better scientists than men",D:"Focusing only on experimental methodology"},correct:"B",exp:"Feminist philosophers extended Kuhn's point about paradigms to argue that who participates in science (social positions) also shapes what knowledge is produced."},
  {q:"The author's overall position on objectivity is best described as:",choices:{A:"Traditional objectivity should be abandoned",B:"Traditional objectivity works when rigorously applied",C:"A revised objectivity acknowledging perspective is achievable",D:"Science should prioritize social justice over evidence"},correct:"C",exp:"The final paragraph describes 'situated objectivity' — maintaining standards while acknowledging perspective. The author endorses this middle position."},
]},
{id:"p3",title:"Memory, Identity, and the Self",cat:"Humanities",
text:"John Locke argued that personal identity consists in continuity of consciousness — specifically, in the capacity to remember one's past experiences. What makes you the same person you were ten years ago is not the matter of your body, most of which has been replaced, but your memory connecting your present self to your past self. This view has intuitive appeal: we hold people responsible for actions they remember committing and excuse those with genuine amnesia.\n\nDerek Parfit challenged Locke's view with thought experiments. Suppose your brain is divided and each half transplanted into a separate body. Both resulting persons have equal claim to memory continuity with you. If memory makes identity, we face the conclusion that you are now two people — or that neither is you. Parfit concluded that personal identity is not what matters. What matters is psychological continuity and connectedness, which can come in degrees and admit of branching.\n\nThe clinical relevance of these debates is not merely academic. Patients with severe memory disorders raise urgent questions about moral and legal responsibility. If a person with advanced dementia has no psychological connection to the self who committed a crime decades ago, it is unclear in what sense punishment would be just. Medicine, law, and ethics are all implicated in how we resolve questions about the boundaries of personal identity.",
questions:[
  {q:"According to Locke's view as described, a person with complete amnesia about their past:",choices:{A:"Is still responsible because the body is the same",B:"Cannot be held responsible since memory continuity is broken",C:"Should be judged by witnesses' memories",D:"Is a different biological organism than their past self"},correct:"B",exp:"Locke holds that personal identity = memory continuity. Without memory linking past to present, identity is severed. The passage notes we 'excuse those with genuine amnesia.'"},
  {q:"Parfit's brain division thought experiment is intended to:",choices:{A:"Show transplant surgery is ethically problematic",B:"Demonstrate Locke's view leads to contradictions",C:"Prove the brain is more important than memory",D:"Argue that identity requires bodily continuity"},correct:"B",exp:"The brain division case produces an absurd result (two people with equal identity claims) from Locke's theory — a reductio ad absurdum showing Locke's view is problematic."},
  {q:"The author mentions dementia patients in the final paragraph primarily to:",choices:{A:"Argue all dementia patients should be excused legally",B:"Show the philosophical debate has real-world implications",C:"Demonstrate medicine has resolved these questions",D:"Criticize the legal system for ignoring philosophy"},correct:"B",exp:"The paragraph shifts from thought experiments to 'clinical relevance' — showing these aren't academic puzzles but have real stakes for medicine, law, and ethics."},
]},
];

// ─── YOUTUBE VIDEOS ───────────────────────────────────────────────────────────
var VIDEOS = {
bb:[
  {title:"Amino Acids & Protein Structure",channel:"Khan Academy MCAT",ytId:"2Jgb_DpaQhM",topic:"Proteins",dur:"12 min"},
  {title:"Enzyme Kinetics",channel:"Khan Academy MCAT",ytId:"qiQ_dwYVpkA",topic:"Enzymes",dur:"15 min"},
  {title:"DNA Replication",channel:"Khan Academy MCAT",ytId:"bee6PWUgPo8",topic:"Genetics",dur:"14 min"},
  {title:"Transcription & Translation",channel:"Khan Academy MCAT",ytId:"itsb2SqR-R0",topic:"Genetics",dur:"16 min"},
  {title:"Cellular Respiration",channel:"Khan Academy MCAT",ytId:"eIMDRTLklIg",topic:"Metabolism",dur:"18 min"},
  {title:"Cell Biology Overview",channel:"Dirty Medicine",ytId:"URUJD5NEXC8",topic:"Cell Biology",dur:"20 min"},
  {title:"Mendelian Genetics",channel:"Khan Academy MCAT",ytId:"CBezq1fFUEA",topic:"Genetics",dur:"13 min"},
],
cp:[
  {title:"Acid-Base Equilibrium",channel:"Khan Academy MCAT",ytId:"GrFIi1LQMEY",topic:"Acids & Bases",dur:"17 min"},
  {title:"Thermodynamics & Gibbs Free Energy",channel:"Khan Academy MCAT",ytId:"ViAmQivKif0",topic:"Thermodynamics",dur:"14 min"},
  {title:"Electrochemistry",channel:"Khan Academy MCAT",ytId:"lZPTaFMHSHg",topic:"Electrochemistry",dur:"19 min"},
  {title:"Optics & Light",channel:"Khan Academy MCAT",ytId:"CJ_GxtyfPbs",topic:"Physics",dur:"12 min"},
  {title:"Fluids & Bernoulli's Principle",channel:"Khan Academy MCAT",ytId:"W5S7kqgNYBQ",topic:"Physics",dur:"16 min"},
  {title:"Organic Chemistry Reactions",channel:"Dirty Medicine",ytId:"wHBNGj6HSOU",topic:"Organic Chemistry",dur:"22 min"},
],
ps:[
  {title:"Classical & Operant Conditioning",channel:"Khan Academy MCAT",ytId:"H6LEcM0E0io",topic:"Learning",dur:"13 min"},
  {title:"Erikson's Stages of Development",channel:"Khan Academy MCAT",ytId:"OhRmE7OhGMQ",topic:"Development",dur:"11 min"},
  {title:"Memory & Forgetting",channel:"Khan Academy MCAT",ytId:"_Rhte3yDmrs",topic:"Cognition",dur:"15 min"},
  {title:"Social Psychology: Conformity",channel:"Khan Academy MCAT",ytId:"qf-4DyR5_nI",topic:"Social Psych",dur:"14 min"},
  {title:"Personality Theories",channel:"Khan Academy MCAT",ytId:"aGJYW_DhYko",topic:"Personality",dur:"12 min"},
  {title:"Sensation & Perception",channel:"Khan Academy MCAT",ytId:"unWnZvXJH2o",topic:"Sensation",dur:"16 min"},
],
cars:[
  {title:"CARS Strategy: How to Read Passages",channel:"Jack Westin MCAT",ytId:"RXm-3PVLZGA",topic:"Strategy",dur:"18 min"},
  {title:"CARS Question Types Explained",channel:"Jack Westin MCAT",ytId:"hHC5PNb1RWk",topic:"Strategy",dur:"22 min"},
  {title:"CARS Timing & Test Strategy",channel:"Altius MCAT",ytId:"xCrPVHcZfLg",topic:"Strategy",dur:"15 min"},
],
};

// ─── CARS VOCABULARY (61 words) ───────────────────────────────────────────────
var WORDS = [
  {w:"Empirical",d:"Based on observation or experiment rather than theory",e:"The author's empirical approach prioritized data over abstract reasoning."},
  {w:"Dichotomy",d:"A division into two opposed or contrasting parts",e:"The passage presents a false dichotomy between tradition and progress."},
  {w:"Reductive",d:"Presenting something in an oversimplified way",e:"Critics called the theory reductive for ignoring cultural factors."},
  {w:"Analogous",d:"Comparable in certain respects; similar in function",e:"The author uses the cell as analogous to a miniature city."},
  {w:"Hegemony",d:"Dominance of one group over others through cultural influence",e:"The essay critiques the hegemony of Western scientific frameworks."},
  {w:"Dialectic",d:"Process of examining conflicting ideas to find truth",e:"The author employs a dialectical method — thesis, antithesis, synthesis."},
  {w:"Epistemology",d:"Branch of philosophy dealing with nature and scope of knowledge",e:"Epistemological questions underpin the debate about scientific objectivity."},
  {w:"Ambivalent",d:"Having mixed or contradictory feelings about something",e:"The narrator is ambivalent about modernity, both embracing and fearing it."},
  {w:"Didactic",d:"Intended to teach, sometimes in an overly moralizing way",e:"The tone is didactic rather than exploratory."},
  {w:"Pragmatic",d:"Dealing with things sensibly and realistically; practical",e:"The author advocates a pragmatic rather than idealist approach to policy."},
  {w:"Myopic",d:"Lacking long-term perspective; short-sighted",e:"The author criticizes myopic thinking that ignores future consequences."},
  {w:"Reconcile",d:"To make compatible; restore harmony between conflicting views",e:"The passage attempts to reconcile scientific and humanistic perspectives."},
  {w:"Nuanced",d:"Characterized by subtle distinctions",e:"A nuanced reading reveals the author's ambivalence."},
  {w:"Polemical",d:"Strongly critical; engaged in controversy",e:"The essay takes a polemical stance against contemporary educational reform."},
  {w:"Insidious",d:"Proceeding gradually in a subtle, harmful way",e:"The author describes the insidious effects of unconscious bias."},
  {w:"Contentious",d:"Causing or likely to cause disagreement",e:"The claim remains contentious among historians."},
  {w:"Tenuous",d:"Very weak or slight; lacking substance",e:"The connection between the phenomena remains tenuous at best."},
  {w:"Egalitarian",d:"Believing in equal rights and opportunities for all",e:"The author's egalitarian vision challenges hierarchical structures."},
  {w:"Axiom",d:"A statement accepted as true as the basis for reasoning",e:"The paper challenges the axiom that growth is inherently good."},
  {w:"Ostensibly",d:"Apparently, but perhaps not actually",e:"The policy was ostensibly designed to help the poor."},
  {w:"Conflate",d:"To combine two concepts, treating them as the same",e:"The author warns against conflating correlation with causation."},
  {w:"Hubris",d:"Excessive pride or self-confidence",e:"The scientist's hubris led him to dismiss competing theories."},
  {w:"Lucid",d:"Expressed clearly; easy to understand",e:"The argument, while complex, is presented in lucid prose."},
  {w:"Iconoclast",d:"Person who challenges established beliefs or institutions",e:"The iconoclast challenged centuries of conventional medical wisdom."},
  {w:"Nascent",d:"Just coming into existence; beginning to develop",e:"At the time, neuroscience was a nascent field."},
  {w:"Paradox",d:"A statement that seems contradictory but may be true",e:"The passage explores the paradox of freedom requiring constraint."},
  {w:"Reify",d:"To make something abstract seem concrete or real",e:"Language reifies social categories that are actually constructed."},
  {w:"Ubiquitous",d:"Present or found everywhere",e:"The author notes that surveillance has become ubiquitous."},
  {w:"Subvert",d:"To undermine the power of an established system",e:"The artist's work subverts traditional notions of beauty."},
  {w:"Equivocal",d:"Ambiguous; open to more than one interpretation",e:"The evidence is equivocal and does not support a firm conclusion."},
  {w:"Categorical",d:"Without exception; absolute",e:"The author makes a categorical distinction between art and craft."},
  {w:"Ameliorate",d:"To make something bad better; to improve",e:"The policy was designed to ameliorate social inequality."},
  {w:"Specious",d:"Superficially plausible but actually wrong",e:"The argument is specious — it sounds convincing but the logic is flawed."},
  {w:"Immutable",d:"Unchanging over time; unable to be changed",e:"The author questions whether human nature is immutable."},
  {w:"Efficacy",d:"The ability to produce a desired result",e:"Studies questioned the efficacy of the intervention."},
  {w:"Exacerbate",d:"To make a problem worse",e:"Inequality exacerbates social unrest."},
  {w:"Tautology",d:"Saying the same thing twice; circular reasoning",e:"The definition is tautological — it uses the word being defined."},
  {w:"Obfuscate",d:"To make unclear or confusing",e:"Technical jargon can obfuscate rather than clarify meaning."},
  {w:"Prescient",d:"Having knowledge of events before they happen",e:"The author's prescient warning went unheeded for decades."},
  {w:"Mendacious",d:"Not telling the truth; lying",e:"The narrator is revealed to be mendacious through contradictions in the text."},
  {w:"Germane",d:"Relevant to the subject under consideration",e:"The historical context is germane to understanding the argument."},
  {w:"Reticent",d:"Not revealing thoughts or feelings readily",e:"The author is reticent about drawing conclusions from limited data."},
  {w:"Heuristic",d:"A problem-solving approach using practical mental shortcuts",e:"The model uses a heuristic rather than a rigorous proof."},
  {w:"Heterodox",d:"Not conforming with established standards; unorthodox",e:"The heterodox economist challenged mainstream assumptions."},
  {w:"Tendentious",d:"Promoting a particular point of view; biased",e:"The tendentious framing reveals a political agenda."},
  {w:"Paucity",d:"Presence of something in small or insufficient quantities",e:"The paucity of evidence makes the conclusion premature."},
  {w:"Sanguine",d:"Optimistic, especially in a difficult situation",e:"The author is sanguine about humanity's capacity for change."},
  {w:"Palliate",d:"To make less severe without removing the cause",e:"The treatment palliated symptoms without addressing the disease."},
  {w:"Milieu",d:"A person's social environment or setting",e:"The work must be understood within the milieu of post-war Europe."},
  {w:"Corroborate",d:"To confirm or support with evidence",e:"Subsequent studies corroborated the original findings."},
  {w:"Laconic",d:"Using very few words; brief and concise",e:"The author's laconic style conceals deep emotional complexity."},
  {w:"Circumscribe",d:"To restrict; limit the range or scope of",e:"Social norms circumscribe individual behavior in ways we rarely notice."},
  {w:"Propitious",d:"Giving or indicating a good chance of success",e:"The timing proved propitious for the reform movement."},
  {w:"Esoteric",d:"Intended for those with specialized knowledge",e:"The philosophical argument is intentionally esoteric."},
  {w:"Solipsism",d:"The view that only one's own mind is certain; extreme self-absorption",e:"The philosopher criticizes modern individualism as bordering on solipsism."},
  {w:"Anathema",d:"Something or someone greatly detested or loathed",e:"Dogma was anathema to the skeptical philosopher."},
  {w:"Recondite",d:"Not known by many people; obscure",e:"The passage draws on recondite historical sources."},
  {w:"Inimical",d:"Tending to obstruct or harm; hostile",e:"The conditions were inimical to scientific progress."},
  {w:"Pellucid",d:"Translucently clear; easily understood",e:"The writing is pellucid, making complex ideas accessible."},
  {w:"Dissonance",d:"Tension or conflict from incompatible elements",e:"The author highlights the dissonance between policy and practice."},
  {w:"Apocryphal",d:"Of doubtful authenticity; widely circulated but probably not true",e:"The apocryphal story serves rhetorical rather than historical purposes."},
  {w:"Liminal",d:"Relating to a threshold or transitional period",e:"The essay examines the liminal space between adolescence and adulthood."},
];

// ─── ENERGY MODES ─────────────────────────────────────────────────────────────
var ENERGY_MODES = {
tired:    {label:"😴 Tired",     desc:"1 micro-task only. You showed up — that counts.",  color:"#8a7090", tasks:1,  style:"micro"},
unmotiv:  {label:"😑 Unmotivated",desc:"2 small tasks. Just the essentials.",              color:AMBER,     tasks:2,  style:"small"},
focused:  {label:"🎯 Focused",   desc:"Full schedule. Let's do this!",                     color:GREEN,     tasks:99, style:"full"},
distract: {label:"🌀 Distracted",desc:"Half schedule + visual content. Keep it engaging.", color:NAVY,      tasks:3,  style:"visual"},
};

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
var SUPABASE_URL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
var SUPABASE_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';

function sbFetch(path, opts){
  return fetch(SUPABASE_URL + path, Object.assign({
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + (window._sbToken || SUPABASE_KEY),
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    }
  }, opts));
}

// ─── PERSISTENCE HELPERS ──────────────────────────────────────────────────────
var mem = {};
function usePersist(userId, suffix, init){
  var key = userId ? (userId + "_" + suffix) : null;
  var st = useState(init); var val = st[0]; var setVal = st[1];
  var rdy = useState(false); var ready = rdy[0]; var setReady = rdy[1];
  useEffect(function(){
    if(!key){ setReady(true); return; }
    if(mem[key] !== undefined){ setVal(mem[key]); setReady(true); return; }
    sbFetch('/rest/v1/user_data?user_id=eq.' + userId + '&key=eq.' + suffix + '&select=value', {method:'GET'})
    .then(function(r){ return r.json(); })
    .then(function(rows){
      if(rows && rows.length > 0 && rows[0].value != null){
        var parsed = JSON.parse(rows[0].value);
        mem[key] = parsed;
        setVal(parsed);
      }
      setReady(true);
    })
    .catch(function(){ setReady(true); });
  }, [key]);
  function save(v){
    setVal(v);
    mem[key] = v;
    if(!key) return;
    sbFetch('/rest/v1/user_data', {
      method: 'POST',
      body: JSON.stringify({user_id: userId, key: suffix, value: JSON.stringify(v)}),
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + (window._sbToken || SUPABASE_KEY),
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      }
    }).catch(function(){});
  }
  return [val, save, ready];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function daysLeft(d){ return Math.max(0,Math.ceil((new Date(d)-new Date())/86400000)); }
function todayStr(){ return new Date().toLocaleDateString("en-US",{weekday:"long"}); }
function fmtDate(d){ return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
function todayKey(){ return new Date().toISOString().slice(0,10); }

function getTodayWord(){
  var day=Math.floor(Date.now()/86400000)%WORDS.length;
  return WORDS[day];
}

function Spinner(props){
  var sz=props.size||18;
  return React.createElement("span",{style:{display:"inline-block",width:sz,height:sz,border:"2px solid "+BORDER,borderTopColor:GREEN,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}});
}

// ─── AI HELPER ────────────────────────────────────────────────────────────────
function callAI(messages,system,max){
  return fetch("/api/claude",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:MODEL,max_tokens:max||1000,system:system,messages:messages}),
  }).then(function(r){return r.json();}).then(function(d){
    if(d.error)throw new Error(d.error.message);
    return d.content?d.content.map(function(b){return b.text||"";}).join(""):"";
  });
}

function buildAILesson(topicTitle,secLabel,cb,onErr){
  callAI([{role:"user",content:"You are an MCAT tutor. Create a concise lesson on: "+topicTitle+" for MCAT section: "+secLabel+". Return a JSON object (no markdown, no code fences) with keys: overview (2-3 sentences), keyPoints (array of 5 strings), deepDive (2-3 paragraphs), clinicalRelevance (1-2 sentences), memorize (array of 3 strings)."}],
    "Return only a raw JSON object. No markdown. No backticks.",1000)
  .then(function(raw){
    var m=raw.match(/\{[\s\S]*\}/);
    if(m){ try{ cb(JSON.parse(m[0])); return; }catch(e){} }
    cb(null); onErr&&onErr();
  }).catch(function(){ cb(null); onErr&&onErr(); });
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
var ALLOWED_EMAIL = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_ALLOWED_EMAIL : '';

function LoginScreen(props){
  var onLogin = props.onLogin;
  var modeState = useState('login'); var mode = modeState[0]; var setMode = modeState[1];
  var emailState = useState(''); var email = emailState[0]; var setEmail = emailState[1];
  var passState = useState(''); var pass = passState[0]; var setPass = passState[1];
  var errState = useState(''); var err = errState[0]; var setErr = errState[1];
  var loadState = useState(false); var load = loadState[0]; var setLoad = loadState[1];

  function submit(){
    if(!email.trim() || !pass.trim()){ setErr('Please fill in all fields.'); return; }
    if(ALLOWED_EMAIL && email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()){
      setErr('This app is private. Access denied.'); return;
    }
    setLoad(true); setErr('');
    var endpoint = mode === 'login' ? '/auth/v1/token?grant_type=password' : '/auth/v1/signup';
    sbFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({email: email.trim(), password: pass}),
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      setLoad(false);
      if(d.error || d.error_description || d.msg){
        setErr(d.error_description || d.msg || d.error || 'Something went wrong.');
        return;
      }
      if(d.access_token){
        window._sbToken = d.access_token;
        var name = d.user && d.user.email ? d.user.email.split('@')[0] : 'there';
        name = name.charAt(0).toUpperCase() + name.slice(1);
        onLogin(d.user.id, name);
      } else if(mode === 'signup' && d.user){
        setMode('login');
        setErr('Account created! Please log in now.');
      } else {
        setErr('Login failed. Please check your credentials.');
      }
    })
    .catch(function(){ setLoad(false); setErr('Connection error. Please try again.'); });
  }

  return(
    <div style={{...T.app, alignItems:'center', justifyContent:'center', padding:'20px 16px'}}>
      <style>{CSS}</style>
      <div style={{width:'100%', maxWidth:360, animation:'pop .3s ease'}}>
        <div style={{textAlign:'center', marginBottom:28}}>
          <div style={{fontSize:42, marginBottom:10}}>📚</div>
          <div style={{fontWeight:'700', fontSize:20, letterSpacing:'0.04em', color:TEXT}}>ProcrastinAid</div>
          <div style={{fontSize:12, color:MUTED, marginTop:4, fontStyle:'italic'}}>Your forgiving MCAT study companion</div>
        </div>
        <div style={T.card}>
          <div style={{fontSize:15, fontWeight:'700', marginBottom:16, color:TEXT, textAlign:'center'}}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </div>
          <div style={{marginBottom:12}}>
            <label style={T.lbl}>Email</label>
            <input style={T.inp} type="email" placeholder="your@email.com" value={email}
              onChange={function(e){setEmail(e.target.value);}}
              onKeyDown={function(e){if(e.key==='Enter')submit();}}
              autoFocus/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={T.lbl}>Password</label>
            <input style={T.inp} type="password" placeholder="••••••••" value={pass}
              onChange={function(e){setPass(e.target.value);}}
              onKeyDown={function(e){if(e.key==='Enter')submit();}}/>
          </div>
          {err && <div style={{fontSize:12, color:err.includes('created')?GREEN:RED, marginBottom:12, textAlign:'center'}}>{err}</div>}
          <button style={{...T.btn(GREEN,CREAM), width:'100%', justifyContent:'center'}}
            onClick={submit} disabled={load}>
            {load ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
          <div style={{textAlign:'center', marginTop:12, fontSize:12, color:MUTED}}>
            {mode === 'login'
              ? <span>No account? <span style={{color:GREEN, cursor:'pointer', fontWeight:'700'}} onClick={function(){setMode('signup');setErr('');}}>Sign up</span></span>
              : <span>Have an account? <span style={{color:GREEN, cursor:'pointer', fontWeight:'700'}} onClick={function(){setMode('login');setErr('');}}>Log in</span></span>
            }
          </div>
        </div>
        <div style={{textAlign:'center', marginTop:12, fontSize:11, color:MUTED}}>
          Private app — authorized users only
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard(props){
  var setup=props.setup,sessions=props.sessions,completedTopics=props.completedTopics,userName=props.userName,onReset=props.onReset,onLogout=props.onLogout,onUpdateTestDate=props.onUpdateTestDate;
  var plan=setup.plan,testDate=setup.testDate;
  var modeState=useState(setup.energyMode||"focused"); var energyMode=modeState[0]; var setEnergyMode=modeState[1];
  var editDateState=useState(false); var editDate=editDateState[0]; var setEditDate=editDateState[1];
  var newDateState=useState(testDate||""); var newDate=newDateState[0]; var setNewDate=newDateState[1];
  var word=getTodayWord();
  var days=testDate?daysLeft(testDate):null;
  var totalTopics=Object.values(ALL_TOPICS).reduce(function(a,b){return a+b.length;},0);
  var doneTopics=completedTopics.length;
  var pct=Math.round((doneTopics/totalTopics)*100);
  var mode=ENERGY_MODES[energyMode]||ENERGY_MODES.focused;
  var todayTasks=(plan&&plan.schedule&&plan.schedule[todayStr()])||["Review your weakest section","Do 10 flashcards","Read one CARS passage"];
  var tasksToShow=mode.style==="micro"?todayTasks.slice(0,1):mode.style==="small"?todayTasks.slice(0,2):mode.style==="visual"?todayTasks.slice(0,Math.ceil(todayTasks.length/2)):todayTasks;
  var sectionPct={};
  SECTIONS.forEach(function(s){
    var total=ALL_TOPICS[s.id].length;
    var done=completedTopics.filter(function(id){return id.startsWith(s.id+"_");}).length;
    sectionPct[s.id]=total>0?Math.round((done/total)*100):0;
  });
  var weakSec=SECTIONS.reduce(function(a,b){return sectionPct[b.id]<sectionPct[a.id]?b:a;});
  var todaySessionDone=sessions.filter(function(s){return s.date===todayKey();}).length>0;
  return (
    <div style={T.page}>
      <div style={{...T.row,justifyContent:"space-between",marginBottom:18}}>
        <div>
          <h1 style={T.h1}>Hi, {userName}! 👋</h1>
          <div style={{fontSize:12,color:MUTED,fontStyle:"italic"}}>{todayStr()}</div>
        </div>
        {testDate&&<div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:MUTED,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.08em"}}>Test Date</div>
          <div style={{fontSize:14,fontWeight:"700",color:AMBER,cursor:"pointer"}} onClick={function(){setEditDate(true);}}>{fmtDate(testDate)} ✏️</div>
          <div style={{fontSize:11,color:GREEN,fontWeight:"600"}}>{days} days left</div>
        </div>}
        {!testDate&&<button style={T.btn(AMBER,"#fff")} onClick={function(){setEditDate(true);}}>Set Test Date</button>}
      </div>
      {editDate&&(
        <div style={{...T.card,borderColor:AMBER,marginBottom:14}}>
          <label style={T.lbl}>Update Test Date</label>
          <div style={T.row}>
            <input style={{...T.inp,flex:1}} type="date" value={newDate} onChange={function(e){setNewDate(e.target.value);}}/>
            <button style={T.btn(AMBER,"#fff")} onClick={function(){if(newDate){onUpdateTestDate(newDate);setEditDate(false);}}} disabled={!newDate}>Save</button>
            <button style={T.out} onClick={function(){setEditDate(false);}}>Cancel</button>
          </div>
        </div>
      )}
      {/* Energy Mode */}
      <div style={T.card}>
        <div style={{...T.row,justifyContent:"space-between",marginBottom:12}}>
          <h2 style={{...T.h2,margin:0}}>How are you feeling today?</h2>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {Object.entries(ENERGY_MODES).map(function(entry){
            var k=entry[0],v=entry[1];
            return <button key={k} style={T.bsm(energyMode===k?v.color:FAINT,energyMode===k?CREAM:MUTED)} onClick={function(){setEnergyMode(k);}}>{v.label}</button>;
          })}
        </div>
        <div style={{fontSize:12,color:mode.color,marginTop:8,fontStyle:"italic"}}>{mode.desc}</div>
      </div>
      {/* Word of the Day */}
      <div style={{...T.warm,borderLeft:"4px solid "+AMBER}}>
        <div style={{fontSize:9,color:AMBER,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>CARS Word of the Day</div>
        <div style={{fontSize:17,fontWeight:"700",color:TEXT,marginBottom:3}}>{word.w}</div>
        <div style={{fontSize:13,color:MUTED,marginBottom:5}}>{word.d}</div>
        <div style={{fontSize:12,color:TEXT,fontStyle:"italic"}}>"{word.e}"</div>
      </div>
      {/* Today's tasks */}
      <div style={T.card}>
        <h2 style={T.h2}>Today's Plan</h2>
        {tasksToShow.map(function(t,i){
          return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"7px 0",borderBottom:i<tasksToShow.length-1?"1px solid "+FAINT:"none"}}>
            <div style={{width:18,height:18,borderRadius:"50%",border:"2px solid "+GREEN,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:GREEN,flexShrink:0,marginTop:1}}>{i+1}</div>
            <span style={{fontSize:13,lineHeight:1.6}}>{t}</span>
          </div>;
        })}
        {mode.style==="visual"&&<div style={{...T.badge(NAVY),marginTop:8,fontSize:11}}>🌀 Distracted mode: check Study Center for videos!</div>}
      </div>
      {/* Overall progress */}
      <div style={T.card}>
        <div style={{...T.row,justifyContent:"space-between",marginBottom:10}}>
          <h2 style={{...T.h2,margin:0}}>AAMC Topic Coverage</h2>
          <span style={{fontSize:14,fontWeight:"800",color:GREEN}}>{doneTopics}/{totalTopics}</span>
        </div>
        <div style={{height:8,background:FAINT,borderRadius:4,overflow:"hidden",marginBottom:12}}>
          <div style={{width:pct+"%",height:"100%",background:"linear-gradient(90deg,"+GREEN+","+SAGE+")",borderRadius:4,transition:"width 1s ease"}}/>
        </div>
        <div style={T.g2}>
          {SECTIONS.map(function(sec){
            return <div key={sec.id} style={{...T.flat,margin:0,borderLeft:"3px solid "+sec.color}}>
              <div style={{fontSize:11,fontWeight:"700",color:sec.color,marginBottom:4}}>{sec.emoji} {sec.short}</div>
              <div style={{fontSize:18,fontWeight:"800",color:sec.color}}>{sectionPct[sec.id]}%</div>
              <div style={{fontSize:10,color:MUTED}}>{completedTopics.filter(function(id){return id.startsWith(sec.id+"_");}).length}/{ALL_TOPICS[sec.id].length} topics</div>
            </div>;
          })}
        </div>
        {weakSec&&<div style={{marginTop:10,fontSize:12,color:RED}}>⚠️ Focus area: {weakSec.label} — only {sectionPct[weakSec.id]}% complete</div>}
      </div>
      {/* Study plan phases */}
      {plan&&plan.phases&&<div>
        <div style={T.h3}>Your Study Phases</div>
        {plan.phases.map(function(ph,i){
          return <div key={i} style={{...T.flat,borderLeft:"3px solid "+GREEN}}>
            <div style={{...T.row,justifyContent:"space-between"}}>
              <span style={{fontWeight:"700",fontSize:13}}>{ph.name}</span>
              <span style={T.badge(NAVY)}>Weeks {ph.weeks}</span>
            </div>
            <div style={{fontSize:12,color:MUTED,marginTop:5,lineHeight:1.6}}>{ph.focus}</div>
          </div>;
        })}
      </div>}
      <div style={{marginTop:22,...T.row,justifyContent:"center",gap:10}}>
        <button style={T.out} onClick={onReset}>Reset Assessment</button>
        <button style={T.out} onClick={onLogout}>Log Out</button>
      </div>
    </div>
  );
}

// ─── STUDY HUB ────────────────────────────────────────────────────────────────
function StudyHub(props){
  var setup=props.setup,sessions=props.sessions,setSessions=props.setSessions,msgs=props.msgs,setMsgs=props.setMsgs,completedTopics=props.completedTopics;
  var tabState=useState("schedule"); var htab=tabState[0]; var setHtab=tabState[1];
  var HTABS=[{id:"schedule",l:"Schedule"},{id:"flashcards",l:"Flashcards"},{id:"quiz",l:"Quiz"},{id:"tutor",l:"AI Tutor"},{id:"pomodoro",l:"⏱ Pomodoro"}];
  return (
    <div style={T.page}>
      <h1 style={T.h1}>Study Hub</h1>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:16}}>
        {HTABS.map(function(t){return <button key={t.id} style={T.bsm(htab===t.id?NAVY:FAINT,htab===t.id?CREAM:MUTED)} onClick={function(){setHtab(t.id);}}>{t.l}</button>;})}
      </div>
      {htab==="schedule"&&<HubSchedule setup={setup} sessions={sessions} setSessions={setSessions}/>}
      {htab==="flashcards"&&<HubFlashcards/>}
      {htab==="quiz"&&<HubQuiz setup={setup}/>}
      {htab==="tutor"&&<HubTutor setup={setup} msgs={msgs} setMsgs={setMsgs}/>}
      {htab==="pomodoro"&&<HubPomodoro sessions={sessions} setSessions={setSessions}/>}
    </div>
  );
}

function HubSchedule(props){
  var setup=props.setup,sessions=props.sessions,setSessions=props.setSessions;
  var plan=setup.plan;
  var days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  var td=todayStr();
  var todayDone=sessions.filter(function(s){return s.date===todayKey();}).length>0;
  function logSession(task){
    setSessions(function(prev){return prev.concat([{task:task,date:todayKey(),ts:Date.now()}]);});
  }
  return (
    <div>
      <div style={{...T.warm,marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:"700",color:TEXT,marginBottom:4}}>Today is {td}</div>
        {todayDone&&<div style={{fontSize:12,color:GREEN}}>✓ You've logged a session today. Great work!</div>}
      </div>
      {days.map(function(day){
        var dayTasks=plan&&plan.schedule&&plan.schedule[day]?plan.schedule[day]:["Rest or light review"];
        return <div key={day} style={{...T.card,borderColor:day===td?GREEN:BORDER,borderWidth:day===td?2:1}}>
          <div style={{...T.row,justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontWeight:"700",fontSize:13,color:day===td?GREEN:TEXT}}>{day}</span>
            {day===td&&<span style={T.badge(GREEN)}>Today</span>}
          </div>
          {dayTasks.map(function(task,i){
            return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:i<dayTasks.length-1?"1px solid "+FAINT:"none"}}>
              <span style={{color:GREEN,flexShrink:0}}>›</span>
              <span style={{fontSize:12,color:MUTED,flex:1}}>{task}</span>
              {day===td&&<button style={T.bsm(GREEN,CREAM)} onClick={function(){logSession(task);}}>Done ✓</button>}
            </div>;
          })}
        </div>;
      })}
    </div>
  );
}

function HubFlashcards(){
  var selState=useState(null); var sel=selState[0]; var setSel=selState[1];
  var idxState=useState(0); var idx=idxState[0]; var setIdx=idxState[1];
  var flipState=useState(false); var flip=flipState[0]; var setFlip=flipState[1];
  var knownState=useState([]); var known=knownState[0]; var setKnown=knownState[1];
  var sec=SECTIONS.find(function(s){return s.id===sel;});
  var cards=sel?FLASHCARDS[sel]:[];
  function fwd(){setFlip(false);setTimeout(function(){setIdx(function(i){return (i+1)%cards.length;});},100);}
  function bk(){setFlip(false);setTimeout(function(){setIdx(function(i){return (i-1+cards.length)%cards.length;});},100);}
  function markKnown(){setKnown(function(p){return p.concat([idx]);});fwd();}
  if(!sel)return(
    <div>
      <p style={T.sub}>Pre-built high-yield cards — no AI needed. Tap to flip, mark what you know.</p>
      {SECTIONS.map(function(s){return <div key={s.id} style={{...T.card,borderColor:s.color+"44",cursor:"pointer"}} onClick={function(){setSel(s.id);setIdx(0);setFlip(false);setKnown([]);}}>
        <div style={{...T.row,justifyContent:"space-between"}}>
          <span style={{fontWeight:"700",fontSize:13}}>{s.emoji} {s.label}</span>
          <span style={T.badge(s.color)}>{FLASHCARDS[s.id].length} cards</span>
        </div>
      </div>;})}
    </div>
  );
  if(known.length===cards.length&&cards.length>0)return(
    <div style={{textAlign:"center"}}><div style={T.card}><div style={{fontSize:40,marginBottom:9}}>🎉</div><h2 style={T.h2}>Deck Complete!</h2><p style={{color:MUTED,fontSize:13,marginBottom:14}}>All {cards.length} cards done!</p><div style={T.row}><button style={T.btn(GREEN,CREAM)} onClick={function(){setKnown([]);setIdx(0);}}>Restart Deck</button><button style={T.out} onClick={function(){setSel(null);}}>Back</button></div></div></div>
  );
  var card=cards[idx];if(!card)return null;
  return(
    <div>
      <div style={{...T.row,justifyContent:"space-between",marginBottom:11}}>
        <button style={T.out} onClick={function(){setSel(null);}}>← Back</button>
        <span style={{fontSize:11,color:MUTED}}>{idx+1}/{cards.length} · {known.length} known</span>
      </div>
      <div onClick={function(){setFlip(function(f){return !f;});}} style={{...T.card,minHeight:180,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",background:flip?WARM:CARD,transition:"background .3s",userSelect:"none",borderColor:sec?sec.color+"44":BORDER}}>
        {card.cat&&<div style={{...T.badge(sec?sec.color:GREEN),marginBottom:10,fontSize:10}}>{card.cat}</div>}
        <div style={{fontSize:flip?13:15,lineHeight:1.8,color:TEXT,maxWidth:440,padding:"0 8px"}}>{flip?card.a:card.q}</div>
        <div style={{fontSize:10,color:MUTED,marginTop:12}}>{flip?"Tap to see question":"Tap to reveal answer"}</div>
      </div>
      {flip?<div style={{...T.row,justifyContent:"center",gap:9,marginTop:9}}>
        <button style={T.btn(RED,"#fff")} onClick={fwd}>Still Learning</button>
        <button style={T.btn(GREEN,CREAM)} onClick={markKnown}>Got It ✓</button>
      </div>:<div style={{...T.row,justifyContent:"center",gap:9,marginTop:9}}>
        <button style={T.bsm()} onClick={bk}>← Prev</button>
        <button style={T.bsm()} onClick={fwd}>Next →</button>
      </div>}
      <div style={{display:"flex",gap:4,marginTop:14,flexWrap:"wrap",justifyContent:"center"}}>
        {cards.map(function(_,i){return <div key={i} style={{width:8,height:8,borderRadius:"50%",background:known.indexOf(i)>=0?GREEN:i===idx?(sec?sec.color:GREEN):FAINT,transition:"background .3s"}}/>;} )}
      </div>
    </div>
  );
}

function HubQuiz(props){
  var setup=props.setup;
  var selState=useState(null); var sel=selState[0]; var setSel=selState[1];
  var qsState=useState([]); var qs=qsState[0]; var setQs=qsState[1];
  var curState=useState(0); var cur=curState[0]; var setCur=curState[1];
  var chosenState=useState(null); var chosen=chosenState[0]; var setChosen=chosenState[1];
  var resultsState=useState([]); var results=resultsState[0]; var setResults=resultsState[1];
  var doneState=useState(false); var done=doneState[0]; var setDone=doneState[1];
  var loadingState=useState(false); var loading=loadingState[0]; var setLoading=loadingState[1];
  function start(sid){
    setSel(sid);setQs([]);setCur(0);setChosen(null);setResults([]);setDone(false);setLoading(true);
    var bank=QUIZBANK[sid]||[];
    var shuffled=bank.slice().sort(function(){return Math.random()-0.5;}).slice(0,5);
    if(shuffled.length>=3){setQs(shuffled);setLoading(false);return;}
    var s=SECTIONS.find(function(x){return x.id===sid;});
    callAI([{role:"user",content:"Write 5 MCAT questions for "+s.label+". Return ONLY a JSON array. Each item: question (string), choices (object A B C D), correct (letter string), explanation (string)."}],
      "MCAT question writer. Return ONLY valid JSON array. No markdown.",1200)
    .then(function(raw){var m=raw.match(/\[[\s\S]*\]/);if(m)setQs(JSON.parse(m[0]).slice(0,5));setLoading(false);})
    .catch(function(){setQs(shuffled);setLoading(false);});
  }
  function pick(ch){
    if(chosen)return;setChosen(ch);
    setResults(function(p){return p.concat([{correct:ch===qs[cur].correct}]);});
  }
  function next(){if(cur+1>=qs.length){setDone(true);return;}setCur(function(c){return c+1;});setChosen(null);}
  var correct=results.filter(function(r){return r.correct;}).length;
  var sObj=SECTIONS.find(function(s){return s.id===sel;});
  if(!sel)return(
    <div>
      <p style={T.sub}>5-question quizzes. Pre-built questions + AI backup when needed.</p>
      {SECTIONS.map(function(sec){return <div key={sec.id} style={{...T.card,borderColor:sec.color+"44",cursor:"pointer"}} onClick={function(){start(sec.id);}}>
        <div style={{...T.row,justifyContent:"space-between"}}>
          <span style={{fontWeight:"700",fontSize:13}}>{sec.emoji} {sec.label}</span>
          <button style={{...T.btn(sec.color,"#fff"),padding:"6px 13px",fontSize:12}}>Start</button>
        </div>
      </div>;})}
    </div>
  );
  if(loading)return<div style={{textAlign:"center",paddingTop:60}}><Spinner size={32}/><div style={{color:MUTED,marginTop:12,fontSize:13}}>Loading questions...</div></div>;
  if(done){
    var p=Math.round((correct/qs.length)*100);
    return<div><div style={{...T.card,textAlign:"center"}}><div style={{fontSize:40,marginBottom:8}}>{p>=80?"🎉":p>=60?"📈":"💪"}</div><h2 style={T.h2}>Quiz Complete!</h2><div style={{fontSize:38,fontWeight:"800",color:p>=80?GREEN:p>=60?AMBER:RED}}>{correct}/{qs.length}</div><div style={{color:MUTED,fontSize:12,marginBottom:12}}>{p}% correct</div><div style={T.row}><button style={T.btn(GREEN,CREAM)} onClick={function(){start(sel);}}>Try Again</button><button style={T.out} onClick={function(){setSel(null);}}>Choose Section</button></div></div></div>;
  }
  var q=qs[cur];if(!q)return null;
  return(
    <div>
      <div style={{...T.row,justifyContent:"space-between",marginBottom:11}}>
        <span style={{fontSize:11,color:MUTED}}>Q {cur+1} / {qs.length}</span>
        <span style={T.badge(sObj?sObj.color:GREEN)}>{sObj?sObj.short:""}</span>
      </div>
      <div style={{...T.card,marginBottom:11}}><p style={{fontSize:14,lineHeight:1.8,margin:0}}>{q.q||q.question}</p></div>
      {["A","B","C","D"].map(function(ch){
        var bg=SURF,col=TEXT,bc=BORDER;
        if(chosen){if(ch===q.correct){bg="#e8f4ec";col=GREEN;bc=GREEN;}else if(ch===chosen){bg="#fbe9e7";col=RED;bc=RED;}else col=MUTED;}
        return <div key={ch} onClick={function(){pick(ch);}} style={{...T.flat,cursor:chosen?"default":"pointer",background:bg,color:col,borderColor:bc,display:"flex",gap:9,alignItems:"flex-start",transition:"all .2s",marginBottom:7}}>
          <span style={{fontWeight:"800",flexShrink:0,fontSize:12}}>{ch}.</span>
          <span style={{fontSize:13,lineHeight:1.65}}>{q.choices?q.choices[ch]:""}</span>
        </div>;
      })}
      {chosen&&<div style={{...T.card,borderColor:GREEN,marginTop:4}}>
        <div style={{fontWeight:"700",color:chosen===q.correct?GREEN:RED,marginBottom:6,fontSize:13}}>{chosen===q.correct?"✓ Correct!":"✗ Incorrect — Answer: "+q.correct}</div>
        <p style={{fontSize:13,lineHeight:1.75,color:MUTED,margin:"0 0 11px"}}>{q.exp||q.explanation}</p>
        <button style={T.btn(GREEN,CREAM)} onClick={next}>{cur+1<qs.length?"Next →":"See Results →"}</button>
      </div>}
    </div>
  );
}

function HubTutor(props){
  var setup=props.setup,msgs=props.msgs,setMsgs=props.setMsgs;
  var plan=setup.plan;
  var inputState=useState(""); var input=inputState[0]; var setInput=inputState[1];
  var loadingState=useState(false); var loading=loadingState[0]; var setLoading=loadingState[1];
  var endRef=useRef(null);
  useEffect(function(){if(endRef.current)endRef.current.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  var sys="You are a warm, encouraging MCAT tutor named ProcrastinAid. Be concise, supportive, and ADHD-friendly. Use short paragraphs and bullet points. If the student seems overwhelmed, acknowledge that first. Weakest section: "+(plan?plan.weakest:"unknown")+". Test date: "+(setup.testDate||"not set")+".";
  function send(){
    if(!input.trim()||loading)return;
    var text=input.trim();setInput("");
    var next=msgs.concat([{role:"user",content:text}]);
    setMsgs(next);setLoading(true);
    callAI(next.slice(-12).map(function(m){return {role:m.role,content:m.content};}),sys,1000)
    .then(function(reply){setMsgs(next.concat([{role:"assistant",content:reply||"I am here to help! Try rephrasing your question."}]));setLoading(false);})
    .catch(function(){setMsgs(next.concat([{role:"assistant",content:"Connection hiccup — please try again. I am still here!"}]));setLoading(false);});
  }
  var starters=["Explain Michaelis-Menten kinetics","How do I improve my CARS score?","Quiz me on Erikson's stages","I feel overwhelmed — help","What should I study today?"];
  return(
    <div style={{display:"flex",flexDirection:"column",height:"60vh"}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:9}}>
        {msgs.length===0&&<div style={{textAlign:"center",paddingTop:24}}>
          <div style={{fontSize:32,marginBottom:8}}>🌿</div>
          <div style={{fontWeight:"700",fontSize:15,marginBottom:5,color:NAVY}}>Ask me anything</div>
          <div style={{color:MUTED,fontSize:12,marginBottom:16}}>Content, strategy, or just need a pep talk.</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
            {starters.map(function(s){return <button key={s} style={T.bsm()} onClick={function(){setInput(s);}}>{s}</button>;})}
          </div>
        </div>}
        {msgs.map(function(m,i){return <div key={i} style={{maxWidth:"88%",padding:"10px 13px",borderRadius:11,alignSelf:m.role==="user"?"flex-end":"flex-start",background:m.role==="user"?WARM:CARD,border:"1px solid "+(m.role==="user"?BORDER:BORDER),color:TEXT,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div>;})}
        {loading&&<div style={{alignSelf:"flex-start",padding:"10px 13px",background:CARD,border:"1px solid "+BORDER,borderRadius:11,display:"flex",gap:7,alignItems:"center"}}><Spinner/><span style={{fontSize:11,color:MUTED}}>Thinking...</span></div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"9px 0 0",borderTop:"1px solid "+BORDER,display:"flex",gap:7,marginTop:8}}>
        <input style={{...T.inp,flex:1}} placeholder="Ask anything..." value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey)send();}}/>
        <button style={{...T.btn(NAVY,CREAM),padding:"9px 15px",flexShrink:0}} onClick={send} disabled={loading}>Send</button>
      </div>
      {msgs.length>0&&<div style={{textAlign:"center",paddingTop:6}}>
        <button style={T.bsm()} onClick={function(){setMsgs([]);}}>Clear chat</button>
      </div>}
    </div>
  );
}

function HubPomodoro(props){
  var sessions=props.sessions,setSessions=props.setSessions;
  var durState=useState(25); var dur=durState[0]; var setDur=durState[1];
  var secsState=useState(null); var secs=secsState[0]; var setSecs=secsState[1];
  var runState=useState(false); var running=runState[0]; var setRunning=runState[1];
  var taskState=useState(""); var task=taskState[0]; var setTask=taskState[1];
  var intervalRef=useRef(null);
  useEffect(function(){
    if(running&&secs>0){intervalRef.current=setTimeout(function(){setSecs(function(s){return s-1;});},1000);}
    else if(running&&secs===0){setRunning(false);if(task.trim()){setSessions(function(prev){return prev.concat([{task:task,date:todayKey(),minutes:dur,ts:Date.now()}]);});}setSecs(null);}
    return function(){clearTimeout(intervalRef.current);};
  },[running,secs]);
  function startTimer(){setSecs(dur*60);setRunning(true);}
  function pause(){setRunning(false);}
  function reset(){setRunning(false);setSecs(null);}
  var display=secs!==null?Math.floor(secs/60)+":"+(secs%60<10?"0":"")+secs%60:dur+":00";
  var todayMins=sessions.filter(function(s){return s.date===todayKey()&&s.minutes;}).reduce(function(a,b){return a+(b.minutes||0);},0);
  return(
    <div>
      <p style={T.sub}>Focus timer. Completed sessions count toward your Progress stats.</p>
      <div style={{...T.card,textAlign:"center"}}>
        <div style={{fontSize:48,fontWeight:"800",color:running?GREEN:NAVY,marginBottom:16,fontFamily:"monospace"}}>{display}</div>
        <div style={{...T.row,justifyContent:"center",gap:8,marginBottom:14}}>
          {[15,20,25,30,45].map(function(d){return <button key={d} style={T.bsm(dur===d&&!running?GREEN:FAINT,dur===d&&!running?CREAM:MUTED)} onClick={function(){if(!running){setDur(d);setSecs(null);}}}>{d}m</button>;})}
        </div>
        <input style={{...T.inp,marginBottom:12,textAlign:"center"}} placeholder="What are you working on?" value={task} onChange={function(e){setTask(e.target.value);}} disabled={running}/>
        <div style={T.row}>
          {!running&&secs===null&&<button style={T.btn(GREEN,CREAM)} onClick={startTimer}>▶ Start</button>}
          {running&&<button style={T.btn(AMBER,"#fff")} onClick={pause}>⏸ Pause</button>}
          {!running&&secs!==null&&secs>0&&<button style={T.btn(GREEN,CREAM)} onClick={function(){setRunning(true);}}>▶ Resume</button>}
          {secs!==null&&<button style={T.out} onClick={reset}>Reset</button>}
        </div>
      </div>
      <div style={{...T.flat,textAlign:"center"}}>
        <div style={{fontSize:11,color:MUTED,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.08em"}}>Today's Study Time</div>
        <div style={{fontSize:24,fontWeight:"800",color:GREEN,marginTop:4}}>{todayMins} min</div>
        <div style={{fontSize:11,color:MUTED}}>{sessions.filter(function(s){return s.date===todayKey();}).length} sessions logged</div>
      </div>
    </div>
  );
}

// ─── PROGRESS TRACKING ────────────────────────────────────────────────────────
function ProgressPage(props){
  var completedTopics=props.completedTopics,sessions=props.sessions,setup=props.setup;
  var tabState=useState("checklist"); var ptab=tabState[0]; var setPtab=tabState[1];
  var PTABS=[{id:"checklist",l:"AAMC Checklist"},{id:"stats",l:"Study Stats"},{id:"simulate",l:"Score Sim"}];
  var testDate=setup.testDate;
  var days=testDate?daysLeft(testDate):null;
  var totalTopics=Object.values(ALL_TOPICS).reduce(function(a,b){return a+b.length;},0);
  var done=completedTopics.length;
  var pct=Math.round((done/totalTopics)*100);
  var totalMins=sessions.reduce(function(a,b){return a+(b.minutes||25);},0);
  var totalHours=Math.round(totalMins/60*10)/10;
  var streak=calcStreak(sessions);
  function calcStreak(sess){
    if(!sess||sess.length===0)return 0;
    var dates=[...new Set(sess.map(function(s){return s.date;}))].sort().reverse();
    var s=0,d=new Date();
    for(var i=0;i<dates.length;i++){
      var td2=new Date(d);td2.setDate(td2.getDate()-i);
      if(dates[i]===td2.toISOString().slice(0,10))s++;
      else break;
    }
    return s;
  }
  var byDay={Monday:0,Tuesday:0,Wednesday:0,Thursday:0,Friday:0,Saturday:0,Sunday:0};
  sessions.forEach(function(s){
    var day=new Date(s.date).toLocaleDateString("en-US",{weekday:"long"});
    if(byDay[day]!==undefined)byDay[day]+=(s.minutes||25);
  });
  var bestDay=Object.entries(byDay).reduce(function(a,b){return b[1]>a[1]?b:a;},["None",0]);
  return(
    <div style={T.page}>
      <h1 style={T.h1}>Progress</h1>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:16}}>
        {PTABS.map(function(t){return <button key={t.id} style={T.bsm(ptab===t.id?NAVY:FAINT,ptab===t.id?CREAM:MUTED)} onClick={function(){setPtab(t.id);}}>{t.l}</button>;})}
      </div>
      {/* Stats strip */}
      <div style={{...T.g3,marginBottom:12}}>
        {[
          {l:"Topics Done",v:done+"/"+totalTopics,c:GREEN},
          {l:"Study Hours",v:totalHours+"h",c:NAVY},
          {l:"Day Streak",v:streak+" 🔥",c:AMBER},
        ].map(function(s){return <div key={s.l} style={{...T.card,textAlign:"center",margin:0}}>
          <div style={{fontSize:9,color:MUTED,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{s.l}</div>
          <div style={{fontSize:20,fontWeight:"800",color:s.c}}>{s.v}</div>
        </div>;})}
      </div>
      {testDate&&<div style={{...T.flat,textAlign:"center",borderColor:AMBER,marginBottom:12}}>
        <div style={{fontSize:11,color:AMBER,fontWeight:"700"}}>Test Date: {fmtDate(testDate)}</div>
        <div style={{fontSize:22,fontWeight:"800",color:GREEN}}>{days} days left</div>
      </div>}
      {ptab==="checklist"&&<Checklist completedTopics={completedTopics}/>}
      {ptab==="stats"&&<StudyStats sessions={sessions} bestDay={bestDay} byDay={byDay}/>}
      {ptab==="simulate"&&<ScoreSim completedTopics={completedTopics}/>}
    </div>
  );
}

function Checklist(props){
  var completedTopics=props.completedTopics;
  var selSecState=useState("bb"); var selSec=selSecState[0]; var setSelSec=selSecState[1];
  var topics=ALL_TOPICS[selSec]||[];
  var done=topics.filter(function(t){return completedTopics.indexOf(t.id)>=0;}).length;
  var secCats=[...new Set(topics.map(function(t){return t.cat;}))];
  return(
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {SECTIONS.map(function(s){
          var total=ALL_TOPICS[s.id].length;
          var d=completedTopics.filter(function(id){return id.startsWith(s.id+"_");}).length;
          return <button key={s.id} style={T.bsm(selSec===s.id?s.color:FAINT,selSec===s.id?CREAM:MUTED)} onClick={function(){setSelSec(s.id);}}>
            {s.emoji} {s.short} ({d}/{total})
          </button>;
        })}
      </div>
      <div style={{...T.flat,textAlign:"center",marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:"700",color:TEXT}}>{done} / {topics.length} topics completed in {SECTIONS.find(function(s){return s.id===selSec;}).label}</div>
        <div style={{height:6,background:FAINT,borderRadius:3,marginTop:8,overflow:"hidden"}}>
          <div style={{width:Math.round(done/topics.length*100)+"%",height:"100%",background:GREEN,borderRadius:3,transition:"width .8s"}}/>
        </div>
      </div>
      {secCats.map(function(cat){
        var catTopics=topics.filter(function(t){return t.cat===cat;});
        var catDone=catTopics.filter(function(t){return completedTopics.indexOf(t.id)>=0;}).length;
        return <div key={cat} style={{marginBottom:12}}>
          <div style={{...T.row,justifyContent:"space-between",marginBottom:6}}>
            <div style={T.h3}>{cat}</div>
            <span style={T.badge(catDone===catTopics.length?GREEN:AMBER)}>{catDone}/{catTopics.length}</span>
          </div>
          {catTopics.map(function(t){
            var isDone=completedTopics.indexOf(t.id)>=0;
            return <div key={t.id} style={{...T.flat,display:"flex",alignItems:"center",gap:10,marginBottom:5,opacity:isDone?1:0.7}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:isDone?GREEN:FAINT,border:"2px solid "+(isDone?GREEN:BORDER),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {isDone&&<span style={{color:CREAM,fontSize:11}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:isDone?GREEN:TEXT,fontWeight:isDone?"600":"400"}}>{t.title}</span>
              {isDone&&<span style={{marginLeft:"auto",fontSize:10,color:GREEN}}>✓ Done</span>}
            </div>;
          })}
        </div>;
      })}
    </div>
  );
}

function StudyStats(props){
  var sessions=props.sessions,bestDay=props.bestDay,byDay=props.byDay;
  var days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  var maxMins=Math.max(...Object.values(byDay),1);
  return(
    <div>
      <div style={T.h3}>Study Time by Day of Week</div>
      <div style={T.card}>
        {days.map(function(day){
          var mins=byDay[day]||0;
          var pct=Math.round((mins/maxMins)*100);
          return <div key={day} style={{marginBottom:8}}>
            <div style={{...T.row,justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:day===bestDay[0]?GREEN:TEXT,fontWeight:day===bestDay[0]?"700":"400"}}>{day}{day===bestDay[0]?" 🏆":""}</span>
              <span style={{fontSize:11,color:MUTED}}>{mins} min</span>
            </div>
            <div style={{height:5,background:FAINT,borderRadius:3,overflow:"hidden"}}>
              <div style={{width:pct+"%",height:"100%",background:day===bestDay[0]?GREEN:SAGE,borderRadius:3}}/>
            </div>
          </div>;
        })}
      </div>
      <div style={T.h3}>Recent Sessions</div>
      {sessions.length===0&&<div style={{...T.flat,color:MUTED,fontSize:13}}>No sessions logged yet. Use the Pomodoro timer or mark tasks done in the Schedule tab.</div>}
      {sessions.slice(-10).reverse().map(function(s,i){return <div key={i} style={{...T.flat,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13}}>{s.task||"Study session"}</span>
        <span style={{fontSize:11,color:MUTED}}>{s.date} {s.minutes?s.minutes+"min":""}</span>
      </div>;})}
    </div>
  );
}

function ScoreSim(props){
  var completedTopics=props.completedTopics;
  var sectionPct={};
  SECTIONS.forEach(function(s){
    var total=ALL_TOPICS[s.id].length;
    var done=completedTopics.filter(function(id){return id.startsWith(s.id+"_");}).length;
    sectionPct[s.id]=total>0?done/total:0;
  });
  function simScore(pct){ return Math.round(118 + pct * 14); }
  var scores=SECTIONS.map(function(s){return simScore(sectionPct[s.id]);});
  var total=scores.reduce(function(a,b){return a+b;},0);
  var interp=total>=517?"Strong for top programs":total>=510?"Competitive for most MD programs":total>=500?"Competitive for DO programs":"Keep building your foundation";
  return(
    <div>
      <div style={{...T.flat,fontSize:12,color:MUTED,lineHeight:1.7,marginBottom:12}}>
        This simulation estimates your projected score based on AAMC topic coverage only. Real score depends on many factors. Use as a motivational guide, not a prediction.
      </div>
      <div style={{...T.card,textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:10,color:MUTED,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Estimated Total Score</div>
        <div style={{fontSize:44,fontWeight:"800",color:total>=510?GREEN:total>=500?AMBER:RED}}>{total}</div>
        <div style={{fontSize:12,color:MUTED}}>/528</div>
        <div style={{fontSize:13,color:TEXT,marginTop:8,fontStyle:"italic"}}>{interp}</div>
      </div>
      <div style={T.g2}>
        {SECTIONS.map(function(s,i){return <div key={s.id} style={{...T.card,textAlign:"center",margin:0,borderColor:s.color+"44"}}>
          <div style={{fontSize:10,fontWeight:"700",color:s.color,marginBottom:4}}>{s.emoji} {s.short}</div>
          <div style={{fontSize:26,fontWeight:"800",color:s.color}}>{scores[i]}</div>
          <div style={{fontSize:10,color:MUTED}}>/132 est.</div>
          <div style={{fontSize:10,color:MUTED,marginTop:3}}>{Math.round(sectionPct[s.id]*100)}% topics done</div>
        </div>;})}
      </div>
    </div>
  );
}

// ─── STUDY CENTER ─────────────────────────────────────────────────────────────
function StudyCenter(props){
  var completedTopics=props.completedTopics,onComplete=props.onComplete;
  var tabState=useState("lessons"); var stab=tabState[0]; var setStab=tabState[1];
  var STABS=[{id:"lessons",l:"Lessons"},{id:"videos",l:"Videos"},{id:"cars",l:"CARS"}];
  return(
    <div style={T.page}>
      <h1 style={T.h1}>Study Center</h1>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:16}}>
        {STABS.map(function(t){return <button key={t.id} style={T.bsm(stab===t.id?NAVY:FAINT,stab===t.id?CREAM:MUTED)} onClick={function(){setStab(t.id);}}>{t.l}</button>;})}
      </div>
      {stab==="lessons"&&<LessonsTab completedTopics={completedTopics} onComplete={onComplete}/>}
      {stab==="videos"&&<VideosTab/>}
      {stab==="cars"&&<CARSTab/>}
    </div>
  );
}

function LessonsTab(props){
  var completedTopics=props.completedTopics,onComplete=props.onComplete;
  var selSecState=useState("bb"); var selSec=selSecState[0]; var setSelSec=selSecState[1];
  var activeLessonState=useState(null); var activeLesson=activeLessonState[0]; var setActiveLesson=activeLessonState[1];
  var lessonDataState=useState(null); var lessonData=lessonDataState[0]; var setLessonData=lessonDataState[1];
  var loadingState=useState(false); var loading=loadingState[0]; var setLoading=loadingState[1];
  var topics=ALL_TOPICS[selSec]||[];
  var sec=SECTIONS.find(function(s){return s.id===selSec;});
  function openLesson(topic){
    setActiveLesson(topic);
    setLessonData(null);
    var prebuilt=PREBUILT_LESSONS[topic.id];
    if(prebuilt){setLessonData(prebuilt);return;}
    setLoading(true);
    buildAILesson(topic.title,sec.label,function(d){
      if(d)setLessonData(d);
      else setLessonData({overview:"Lesson for "+topic.title+" in "+sec.label+".",keyPoints:["This is a high-yield MCAT topic.","Focus on mechanism and clinical application.","Practice with passage-based questions.","Use the Tutor for deeper explanations.","Build flashcards on this topic."],deepDive:"Go to the AI Tutor and ask: Teach me about "+topic.title+". You will get a full interactive explanation.",clinicalRelevance:"Ask the Tutor: How is "+topic.title+" tested on the MCAT?",memorize:["Core definition of "+topic.title,"Key steps or components","Clinical connection for the MCAT"]});
      setLoading(false);
    });
  }
  function markDone(){
    if(activeLesson&&completedTopics.indexOf(activeLesson.id)<0){
      onComplete(activeLesson.id);
    }
    setActiveLesson(null);setLessonData(null);
  }
  if(activeLesson)return(
    <div>
      <button style={T.out} onClick={function(){setActiveLesson(null);setLessonData(null);}}>← Back to Topics</button>
      <div style={{marginTop:14}}>
        <h2 style={T.h2}>{activeLesson.title}</h2>
        <span style={T.badge(sec?sec.color:GREEN)}>{activeLesson.cat}</span>
        {completedTopics.indexOf(activeLesson.id)>=0&&<span style={{...T.badge(GREEN),marginLeft:8}}>✓ Completed</span>}
        {loading&&<div style={{textAlign:"center",paddingTop:40}}><Spinner size={30}/><div style={{color:MUTED,marginTop:10,fontSize:13}}>Generating lesson...</div></div>}
        {lessonData&&<div style={{marginTop:14}}>
          <div style={{...T.warm,marginBottom:14}}><p style={{fontSize:14,lineHeight:1.75,margin:0,color:TEXT}}>{lessonData.overview}</p></div>
          {lessonData.keyPoints&&lessonData.keyPoints.length>0&&<div><div style={T.h3}>Key Points</div>{lessonData.keyPoints.map(function(kp,i){return <div key={i} style={{display:"flex",gap:9,marginBottom:8,fontSize:13}}><span style={{color:GREEN,fontWeight:"700",flexShrink:0}}>{i+1}.</span><span style={{lineHeight:1.7}}>{kp}</span></div>;})}</div>}
          {lessonData.deepDive&&<div><div style={T.div}/><div style={T.h3}>Deep Dive</div><div style={{fontSize:13,lineHeight:1.85,color:TEXT,whiteSpace:"pre-line"}}>{lessonData.deepDive}</div></div>}
          {lessonData.clinicalRelevance&&<div><div style={T.div}/><div style={T.h3}>MCAT Relevance</div><div style={{...T.flat,fontSize:13,lineHeight:1.7,color:MUTED}}>{lessonData.clinicalRelevance}</div></div>}
          {lessonData.memorize&&lessonData.memorize.length>0&&<div><div style={T.div}/><div style={T.h3}>Memorize These</div>{lessonData.memorize.map(function(m,i){return <div key={i} style={{...T.flat,fontSize:12,color:AMBER,lineHeight:1.6,borderLeft:"3px solid "+AMBER}}>★ {m}</div>;})}</div>}
          <div style={{marginTop:20}}>
            <button style={T.btn(GREEN,CREAM)} onClick={markDone}>{completedTopics.indexOf(activeLesson.id)>=0?"← Back":"✓ Mark as Complete & Continue"}</button>
          </div>
        </div>}
      </div>
    </div>
  );
  return(
    <div>
      <div style={{...T.row,marginBottom:14}}>
        {SECTIONS.map(function(s){
          var total=ALL_TOPICS[s.id].length;
          var d=completedTopics.filter(function(id){return id.startsWith(s.id+"_");}).length;
          return <button key={s.id} style={T.bsm(selSec===s.id?s.color:FAINT,selSec===s.id?CREAM:MUTED)} onClick={function(){setSelSec(s.id);}}>
            {s.emoji} {s.short} {d}/{total}
          </button>;
        })}
      </div>
      <div style={{fontSize:12,color:MUTED,marginBottom:12}}>
        Pre-built lessons for high-yield topics. AI generates the rest on demand. Completing a lesson auto-checks it off your AAMC checklist.
      </div>
      {[...new Set(topics.map(function(t){return t.cat;}))].map(function(cat){
        var catTopics=topics.filter(function(t){return t.cat===cat;});
        return <div key={cat} style={{marginBottom:14}}>
          <div style={T.h3}>{cat}</div>
          {catTopics.map(function(t){
            var isDone=completedTopics.indexOf(t.id)>=0;
            var hasPrebuilt=!!PREBUILT_LESSONS[t.id];
            return <div key={t.id} style={{...T.flat,display:"flex",alignItems:"center",gap:10,cursor:"pointer",borderColor:isDone?GREEN+"44":BORDER}} onClick={function(){openLesson(t);}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:isDone?GREEN:FAINT,border:"2px solid "+(isDone?GREEN:BORDER),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {isDone&&<span style={{color:CREAM,fontSize:10}}>✓</span>}
              </div>
              <span style={{fontSize:13,flex:1,color:isDone?GREEN:TEXT}}>{t.title}</span>
              {hasPrebuilt&&<span style={{fontSize:9,color:MUTED,flexShrink:0}}>pre-built</span>}
              {!hasPrebuilt&&!isDone&&<span style={{fontSize:9,color:SAGE,flexShrink:0}}>AI</span>}
              <span style={{color:MUTED,fontSize:12,flexShrink:0}}>→</span>
            </div>;
          })}
        </div>;
      })}
    </div>
  );
}

function VideosTab(){
  var selSecState=useState("bb"); var selSec=selSecState[0]; var setSelSec=selSecState[1];
  var vids=VIDEOS[selSec]||[];
  return(
    <div>
      <div style={{...T.row,marginBottom:14}}>
        {SECTIONS.map(function(s){return <button key={s.id} style={T.bsm(selSec===s.id?s.color:FAINT,selSec===s.id?CREAM:MUTED)} onClick={function(){setSelSec(s.id);}}>{s.emoji} {s.short}</button>;})}
      </div>
      <div style={{fontSize:12,color:MUTED,marginBottom:12}}>Curated free videos from Khan Academy MCAT, Dirty Medicine, and Jack Westin.</div>
      {vids.map(function(v){return <div key={v.ytId} style={T.card}>
        <div style={{marginBottom:10}}>
          <div style={{fontWeight:"700",fontSize:14,color:TEXT,marginBottom:3}}>{v.title}</div>
          <div style={{...T.row,gap:8}}>
            <span style={T.badge(NAVY)}>{v.channel}</span>
            <span style={T.badge(MUTED)}>{v.dur}</span>
            <span style={T.badge(GREEN)}>{v.topic}</span>
          </div>
        </div>
        <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:8,overflow:"hidden",background:"#000"}}>
          <iframe
            src={"https://www.youtube.com/embed/"+v.ytId}
            style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none",borderRadius:8}}
            allowFullScreen
            title={v.title}
          />
        </div>
      </div>;})}
    </div>
  );
}

function CARSTab(){
  var selPassageState=useState(null); var selP=selPassageState[0]; var setSelP=selPassageState[1];
  var choicesState=useState({}); var choices=choicesState[0]; var setChoices=choicesState[1];
  var submittedState=useState(false); var submitted=submittedState[0]; var setSubmitted=submittedState[1];
  function selectAnswer(qi,ch){if(!submitted)setChoices(function(prev){var n=Object.assign({},prev);n[qi]=ch;return n;});}
  function submit(){if(Object.keys(choices).length===selP.questions.length)setSubmitted(true);}
  if(!selP)return(
    <div>
      <p style={T.sub}>Full CARS passages with passage-based questions. Pre-built — no AI needed.</p>
      {CARS_PASSAGES.map(function(p){return <div key={p.id} style={{...T.card,cursor:"pointer",borderColor:AMBER+"44"}} onClick={function(){setSelP(p);setChoices({});setSubmitted(false);}}>
        <div style={{fontWeight:"700",fontSize:14,marginBottom:4}}>{p.title}</div>
        <div style={{...T.row}}>
          <span style={T.badge(AMBER)}>{p.cat}</span>
          <span style={T.badge(MUTED)}>{p.questions.length} questions</span>
        </div>
      </div>;})}
    </div>
  );
  var correct=submitted?selP.questions.filter(function(q,i){return choices[i]===q.correct;}).length:0;
  return(
    <div>
      <button style={T.out} onClick={function(){setSelP(null);}}>← Back</button>
      <div style={{marginTop:14}}>
        <h2 style={T.h2}>{selP.title}</h2>
        <span style={T.badge(AMBER)}>{selP.cat}</span>
        <div style={{...T.warm,marginTop:12,marginBottom:16}}>
          <p style={{fontSize:13,lineHeight:1.85,margin:0,whiteSpace:"pre-line"}}>{selP.text}</p>
        </div>
        {selP.questions.map(function(q,qi){
          return <div key={qi} style={{...T.card,marginBottom:10}}>
            <div style={{fontWeight:"700",fontSize:13,marginBottom:10,lineHeight:1.6}}>{qi+1}. {q.q}</div>
            {["A","B","C","D"].map(function(ch){
              var isChosen=choices[qi]===ch;
              var isCorrect=ch===q.correct;
              var bg=SURF,col=TEXT,bc=BORDER;
              if(submitted){if(isCorrect){bg="#e8f4ec";col=GREEN;bc=GREEN;}else if(isChosen&&!isCorrect){bg="#fbe9e7";col=RED;bc=RED;}else col=MUTED;}
              else if(isChosen){bg=WARM;bc=NAVY;}
              return <div key={ch} onClick={function(){selectAnswer(qi,ch);}} style={{...T.flat,cursor:submitted?"default":"pointer",background:bg,color:col,borderColor:bc,display:"flex",gap:9,transition:"all .2s",marginBottom:5}}>
                <span style={{fontWeight:"700",flexShrink:0,fontSize:12}}>{ch}.</span>
                <span style={{fontSize:13,lineHeight:1.6}}>{q.choices[ch]}</span>
              </div>;
            })}
            {submitted&&<div style={{...T.flat,borderLeft:"3px solid "+GREEN,marginTop:6,background:"#e8f4ec"}}>
              <div style={{fontWeight:"700",color:choices[qi]===q.correct?GREEN:RED,fontSize:12,marginBottom:4}}>{choices[qi]===q.correct?"✓ Correct!":"✗ Incorrect — Answer: "+q.correct}</div>
              <div style={{fontSize:12,color:MUTED,lineHeight:1.65}}>{q.exp}</div>
            </div>}
          </div>;
        })}
        {!submitted&&<button style={T.btn(AMBER,"#fff")} onClick={submit} disabled={Object.keys(choices).length<selP.questions.length}>
          Submit Answers ({Object.keys(choices).length}/{selP.questions.length} answered)
        </button>}
        {submitted&&<div style={{...T.card,textAlign:"center"}}>
          <div style={{fontSize:28,fontWeight:"800",color:correct===selP.questions.length?GREEN:AMBER}}>{correct}/{selP.questions.length} correct</div>
          <button style={{...T.btn(NAVY,CREAM),marginTop:10}} onClick={function(){setSelP(null);}}>Try Another Passage</button>
        </div>}
      </div>
    </div>
  );
}

// ─── ASSESSMENT ───────────────────────────────────────────────────────────────
function Assessment(props){
  var onComplete=props.onComplete;
  var stepState=useState("intro"); var step=stepState[0]; var setStep=stepState[1];
  var qiState=useState(0); var qi=qiState[0]; var setQi=qiState[1];
  var ansState=useState({}); var ans=ansState[0]; var setAns=ansState[1];
  var pickedState=useState(null); var picked=pickedState[0]; var setPicked=pickedState[1];
  var tdState=useState(""); var testDate=tdState[0]; var setTD=tdState[1];
  var hoursState=useState(15); var hours=hoursState[0]; var setHours=hoursState[1];
  var goalState=useState("MD program"); var goal=goalState[0]; var setGoal=goalState[1];
  var ASMQS=[
    {sec:"bb",q:"When an enzyme is saturated with substrate, increasing substrate concentration will:",ch:["Have no effect on reaction rate","Increase rate indefinitely","Denature the enzyme","Decrease reaction rate"],ans:0},
    {sec:"bb",q:"Which process repairs replication errors in DNA?",ch:["Nucleotide excision repair","Base excision repair","Mismatch repair","Direct reversal"],ans:2},
    {sec:"bb",q:"In the lac operon, the repressor protein binds to the:",ch:["Promoter","Operator","Structural genes","Ribosome"],ans:1},
    {sec:"cp",q:"A buffer is most effective when:",ch:["pH is far from pKa","pH equals pKa (±1)","Temperature is low","Concentration is very high"],ans:1},
    {sec:"cp",q:"Which quantum number describes the shape of an orbital?",ch:["Principal (n)","Angular momentum (l)","Magnetic (ml)","Spin (ms)"],ans:1},
    {sec:"cp",q:"A ball at its highest point after being thrown upward has acceleration:",ch:["Zero","Upward","Downward, 9.8 m/s²","Equal to initial velocity"],ans:2},
    {sec:"ps",q:"Erikson's conflict for young adulthood (18-40) is:",ch:["Identity vs. Role Confusion","Intimacy vs. Isolation","Generativity vs. Stagnation","Integrity vs. Despair"],ans:1},
    {sec:"ps",q:"The bystander effect is best explained by:",ch:["Social facilitation","Conformity","Diffusion of responsibility","Deindividuation"],ans:2},
    {sec:"ps",q:"Classical conditioning differs from operant conditioning in that:",ch:["Only operant uses reinforcement","Classical pairs stimuli; operant pairs behavior with consequence","Classical applies only to animals","Operant involves involuntary responses"],ans:1},
    {sec:"cars",q:"A passage argues technology outpaced ethics. The author most likely wants readers to:",ch:["Abandon technology","Develop ethical frameworks alongside technology","Slow all research permanently","Ignore ethics"],ans:1},
    {sec:"cars",q:"An 'assumption' in a CARS argument is best defined as:",ch:["A conclusion backed by evidence","An unstated premise the argument relies on","A counterargument","A verified factual claim"],ans:1},
    {sec:"cars",q:"When a CARS author uses 'however,' it most likely signals:",ch:["Agreement with the previous claim","A contrast or qualification","A summary of the passage","Additional evidence"],ans:1},
  ];
  var q=ASMQS[qi];
  function pick(idx){
    if(picked!==null)return;
    setPicked(idx);
    var next=Object.assign({},ans);
    next[qi]={sec:q.sec,correct:idx===q.ans};
    setAns(next);
    setTimeout(function(){setPicked(null);if(qi+1<ASMQS.length)setQi(function(i){return i+1;});else setStep("goals");},700);
  }
  function generate(){
    setStep("gen");
    var ss={};
    SECTIONS.forEach(function(s){
      var qs=Object.values(ans).filter(function(a){return a.sec===s.id;});
      ss[s.id]={correct:qs.filter(function(a){return a.correct;}).length,total:qs.length,pct:qs.length?Math.round(qs.filter(function(a){return a.correct;}).length/qs.length*100):0};
    });
    var wk=SECTIONS.reduce(function(a,b){return ss[b.id].pct<ss[a.id].pct?b:a;});
    var st=SECTIONS.reduce(function(a,b){return ss[b.id].pct>ss[a.id].pct?b:a;});
    function buildPlan(ss,wk,st,hours){
      var w=wk.short;
      return {
        summary:"Your diagnostic shows "+wk.label+" needs the most focus, while "+st.label+" is your current strength. Your plan is built around closing that gap before your test.",
        weeklyHours:hours,weakest:wk.id,strongest:st.id,
        sectionInsights:{
          bb:ss.bb.pct>=67?"Good foundation — focus on metabolic pathways and genetics regulation.":"Build from protein structure and enzyme kinetics first, then metabolism.",
          cp:ss.cp.pct>=67?"Solid base — drill physics equations and organic mechanisms.":"Start with acid-base chemistry and Newton's laws, the two highest-yield areas.",
          ps:ss.ps.pct>=67?"Strong — keep up with Erikson, Piaget, and social psychology.":"Focus on learning theories, memory, and development stages first.",
          cars:ss.cars.pct>=67?"Good reader — practice timed passages daily to maintain speed.":"Read one passage every single day and practice identifying the main argument.",
        },
        phases:[
          {name:"Foundation",weeks:"1-4",focus:"Build core content in "+wk.label+". Review fundamentals across all sections.",priority:[w]},
          {name:"Mastery",weeks:"5-8",focus:"Deep practice in "+wk.label+" and CARS. Begin timed section practice.",priority:[w,"CARS"]},
          {name:"Test Prep",weeks:"9-12",focus:"Full-length practice exams, mistake review, and final weak-area drilling.",priority:["Full-lengths","Review"]},
        ],
        schedule:{
          Monday:[w+" content review 60min","CARS passage 30min"],
          Tuesday:["B/B or C/P problems 60min","P/S flashcards 30min"],
          Wednesday:["Light review 45min","Anki flashcards 20min"],
          Thursday:[w+" practice questions 60min","CARS passage 30min"],
          Friday:["B/B or C/P content 60min","P/S review 30min"],
          Saturday:["Full section timed practice 3hr"],
          Sunday:["Review all mistakes 90min","Plan next week 20min"],
        },
        tips:[
          "Since "+wk.label+" is your biggest gap, spend at least 40% of weekly hours there.",
          "Do one CARS passage every single day — daily consistency beats volume.",
          "Review every wrong answer immediately after each quiz. That is where real learning happens.",
        ],
      };
    }
    var plan=buildPlan(ss,wk,st,hours);
    setTimeout(function(){ onComplete({plan:plan,sectionScores:ss,testDate:testDate,hours:hours,goal:goal,createdAt:Date.now()}); },800);
  }
  if(step==="intro")return(
    <div style={T.page}>
      <div style={{textAlign:"center",paddingTop:28}}>
        <div style={{fontSize:48,marginBottom:14}}>🌿</div>
        <h1 style={{...T.h1,fontSize:24,marginBottom:8}}>Let's get to know you</h1>
        <p style={{...T.sub,maxWidth:400,margin:"0 auto 24px"}}>
          12 quick diagnostic questions across all 4 MCAT sections. No prior scores needed —
          we find your starting point and build your personalized plan from there.
        </p>
        <button style={T.btn(GREEN,CREAM)} onClick={function(){setStep("q");}}>Begin Diagnostic</button>
        <div style={{marginTop:12,fontSize:12,color:MUTED,fontStyle:"italic"}}>No pressure. This is just a starting point, not a grade.</div>
      </div>
    </div>
  );
  if(step==="q"){
    var pct=Math.round((qi/ASMQS.length)*100);
    var sec=SECTIONS.find(function(s){return s.id===q.sec;});
    return(
      <div style={T.page}>
        <div style={{marginBottom:14}}>
          <div style={{...T.row,justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:12,color:MUTED}}>Question {qi+1} / {ASMQS.length}</span>
            <span style={T.badge(sec?sec.color:GREEN)}>{sec?sec.emoji:""} {sec?sec.short:""}</span>
          </div>
          <div style={{height:5,background:FAINT,borderRadius:3}}>
            <div style={{width:pct+"%",height:"100%",background:GREEN,borderRadius:3,transition:"width .4s"}}/>
          </div>
        </div>
        <div style={{...T.card,minHeight:70,animation:"fadeUp .2s ease"}}><p style={{fontSize:14,lineHeight:1.8,margin:0}}>{q.q}</p></div>
        {q.ch.map(function(ch,i){
          var bg=SURF,col=TEXT,bc=BORDER;
          if(picked!==null){if(i===q.ans){bg="#e8f4ec";col=GREEN;bc=GREEN;}else if(i===picked){bg="#fbe9e7";col=RED;bc=RED;}else col=MUTED;}
          return <div key={i} onClick={function(){pick(i);}} style={{...T.flat,cursor:picked!==null?"default":"pointer",background:bg,color:col,borderColor:bc,display:"flex",gap:9,alignItems:"flex-start",transition:"all .2s",marginBottom:7}}>
            <span style={{fontWeight:"800",flexShrink:0,fontSize:12,minWidth:14}}>{["A","B","C","D"][i]}.</span>
            <span style={{fontSize:13,lineHeight:1.6}}>{ch}</span>
            {picked!==null&&i===q.ans&&<span style={{marginLeft:"auto",color:GREEN,flexShrink:0}}>✓</span>}
          </div>;
        })}
        <div style={{fontSize:11,color:MUTED,marginTop:4}}>{Object.keys(ans).length} of {ASMQS.length} answered</div>
      </div>
    );
  }
  if(step==="goals")return(
    <div style={T.page}>
      <h1 style={T.h1}>Almost there!</h1>
      <p style={T.sub}>Set your test date so we can build your calendar around it.</p>
      <div style={T.card}>
        <label style={T.lbl}>Test Date — when do you need to be ready?</label>
        <input style={T.inp} type="date" value={testDate} onChange={function(e){setTD(e.target.value);}}/>
        {testDate&&<div style={{fontSize:11,color:GREEN,marginTop:6}}>🗓 {daysLeft(testDate)} days to prepare</div>}
      </div>
      <div style={T.card}>
        <label style={T.lbl}>Study hours available per week</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {[5,10,15,20,25,30].map(function(h){return <button key={h} style={T.bsm(hours===h?GREEN:FAINT,hours===h?CREAM:MUTED)} onClick={function(){setHours(h);}}>{h} hrs</button>;})}
        </div>
      </div>
      <div style={T.card}>
        <label style={T.lbl}>Your goal</label>
        {["MD program — aiming 510+","DO program — aiming 500+","Top MD program — aiming 517+","Elite program — aiming 522+"].map(function(g){return(
          <div key={g} onClick={function(){setGoal(g);}} style={{...T.flat,cursor:"pointer",marginBottom:6,borderColor:goal===g?GREEN:BORDER,background:goal===g?"#e8f4ec":SURF}}>
            <span style={{fontSize:13,color:goal===g?GREEN:TEXT}}>{g}</span>
          </div>
        );})}
      </div>
      <button style={T.btn(GREEN,CREAM)} onClick={generate} disabled={!testDate}>Build My Plan</button>
      <div style={{marginTop:10,fontSize:12,color:MUTED,fontStyle:"italic"}}>No test date yet? That is okay — you can set it later from the Dashboard.</div>
    </div>
  );
  return(
    <div style={{...T.page,textAlign:"center",paddingTop:80}}>
      <Spinner size={32}/>
      <h2 style={{...T.h2,color:GREEN,marginTop:16}}>Building your personalized plan...</h2>
      <p style={{color:MUTED,fontSize:13,fontStyle:"italic"}}>Analyzing your diagnostic results</p>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App(){
  var userIdState=useState(null); var userId=userIdState[0]; var setUserId=userIdState[1];
  var userNameState=useState(""); var userName=userNameState[0]; var setUserName=userNameState[1];
  var setupArr=usePersist(userId,"setup_v1",null);
  var tabArr=usePersist(userId,"tab_v1","dashboard");
  var sessArr=usePersist(userId,"sessions_v1",[]);
  var msgsArr=usePersist(userId,"msgs_v1",[]);
  var topicsArr=usePersist(userId,"completed_v1",[]);
  var setup=setupArr[0];      var setSetup=setupArr[1];      var setupReady=setupArr[2];
  var tab=tabArr[0];          var setTab=tabArr[1];
  var sessions=sessArr[0];    var setSessions=sessArr[1];
  var msgs=msgsArr[0];        var setMsgs=msgsArr[1];
  var completedTopics=topicsArr[0]; var setCompletedTopics=topicsArr[1]; var topicsReady=topicsArr[2];
  var dataReady=!userId||(setupReady&&topicsReady);
  function login(id,n){setUserId(id);setUserName(n);}
  function logout(){setUserId(null);setUserName("");window._sbToken=null;}
  function reset(){setSetup(null);setCompletedTopics([]);setSessions([]);setMsgs([]);setTab("dashboard");}
  function onTopicComplete(id){
    setCompletedTopics(function(prev){return prev.indexOf(id)>=0?prev:prev.concat([id]);});
  }
  function updateTestDate(d){
    setSetup(function(s){return Object.assign({},s,{testDate:d});});
  }
  var TABS=[
    {id:"dashboard",l:"Home",ic:"🌿"},
    {id:"hub",l:"Study Hub",ic:"📖"},
    {id:"progress",l:"Progress",ic:"📊"},
    {id:"center",l:"Study Center",ic:"🎓"},
  ];
  var globalStyle=CSS;
  if(!dataReady)return(
    <div style={{...T.app,alignItems:"center",justifyContent:"center",gap:14}}>
      <style>{globalStyle}</style>
      <Spinner size={28}/>
      <div style={{color:MUTED,fontSize:13,fontStyle:"italic"}}>Loading your progress...</div>
    </div>
  );
  if(!userId)return <div><style>{globalStyle}</style><LoginScreen onLogin={login}/></div>;
  if(!setup)return(
    <div style={T.app}>
      <style>{globalStyle}</style>
      <div style={T.bar}>
        <div style={T.logo}>📚 ProcrastinAid</div>
        <button style={T.bsm()} onClick={logout}>Log Out</button>
      </div>
      <div style={{flex:1,overflowY:"auto"}}><Assessment onComplete={function(d){setSetup(d);setTab("dashboard");}}/></div>
    </div>
  );
  var pages={
    dashboard:<Dashboard setup={setup} sessions={sessions} completedTopics={completedTopics} userName={userName} onReset={reset} onLogout={logout} onUpdateTestDate={updateTestDate}/>,
    hub:<StudyHub setup={setup} sessions={sessions} setSessions={setSessions} msgs={msgs} setMsgs={setMsgs} completedTopics={completedTopics}/>,
    progress:<ProgressPage setup={setup} sessions={sessions} completedTopics={completedTopics}/>,
    center:<StudyCenter completedTopics={completedTopics} onComplete={onTopicComplete}/>,
  };
  return(
    <div style={T.app}>
      <style>{globalStyle}</style>
      <div style={T.bar}>
        <div style={T.logo}>📚 ProcrastinAid</div>
        <div style={T.tabs}>
          {TABS.map(function(t){return <button key={t.id} style={T.tab(tab===t.id)} onClick={function(){setTab(t.id);}}>{t.ic} {t.l}</button>;})}
        </div>
        <button style={{...T.bsm(),flexShrink:0,marginLeft:4}} onClick={logout}>Log Out</button>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>{pages[tab]||pages.dashboard}</div>
    </div>
  );
}
