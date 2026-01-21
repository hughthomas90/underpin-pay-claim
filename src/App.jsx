import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Users, TrendingUp, AlertCircle, Briefcase, ToggleLeft, ToggleRight, Coins, User, BarChart3, Table2 } from 'lucide-react';

// --- Shared Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

// --- Constants ---
const NI_RATE = 0.15; // 15% (April 2025)
const NI_THRESHOLD = 5000; // £5,000 (April 2025)
const PENSION_RATE = 0.11; // 11% Pension
const APP_LEVY_RATE = 0.005; // 0.5% Levy
const BONUS_RATE = 0.10; // 10% Bonus
const MEDIAN_IMPUTATION = 47500;

// --- Helper Functions ---
const detectBonus = (title, salary) => {
  if (!title) return false;
  const t = title.toLowerCase();
  
  // Rule 1: Salary Threshold
  if (salary >= 55000) return true;

  // Rule 2: Explicit Titles
  if (t.includes('senior editor')) return true; 
  if (t.includes('chief')) return true; 
  if (t.includes('manager') || t.includes('head') || t.includes('director') || t.includes('publisher')) return true;

  return false;
};

const calculateTCOE = (baseSalary, bonusAmount = 0) => {
  const pension = baseSalary * PENSION_RATE; // Pension on Base only
  const totalEarnings = baseSalary + bonusAmount;
  const niableAmount = Math.max(0, totalEarnings - NI_THRESHOLD);
  const ni = niableAmount * NI_RATE;
  const levy = totalEarnings * APP_LEVY_RATE;
  return baseSalary + bonusAmount + pension + ni + levy;
};

const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

// --- Sub-Component: Salary Modeler ---
const SalaryModeler = () => {
  const [data, setData] = useState([]);
  const [underpin, setUnderpin] = useState(3000);
  const [percent, setPercent] = useState(8);
  const [testSalary, setTestSalary] = useState(55000);
  const [includeTCOE, setIncludeTCOE] = useState(false);
  const [includeBonuses, setIncludeBonuses] = useState(false);

  useEffect(() => {
    // Full Dataset
    const rawText = `
1_Catherine_O'HaraEditor-in-Chief, The Lancet RheumatologyUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
1_Catherine_O'HaraEditor-in-Chief, The Lancet Child & Adolescent HealthUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
1_Catherine_O'HaraEditor-in-Chief, The Lancet Diabetes & EndocrinologyUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
1_Catherine_O'HaraEditor-in-Chief, The Lancet Global HealthUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
2_Dan_LewsleyOrigination ManagerUK - London (London Wall)Origination Manager£65,000
2_Dan_LewsleyArt & Logistics ManagerUK - London (London Wall)Art & Logistics Manager£65,000
2_Dan_LewsleyManaging EditorUK - London (London Wall)55000
2_Dan_LewsleyManaging EditorUK - London (London Wall)55000
2_Dan_LewsleyOperations ManagerUK - London (London Wall)Operations Manager50,000–55,000£52,500
2_Dan_LewsleyOperations & Project Manager (the Lancet journals)UK - London (London Wall)55000
3_David_CollingridgeDeputy Editor, The Lancet OncologyUK - London (London Wall)Deputy Editor50,000–60,000£55,000
3_David_CollingridgeEditor-in-Chief, The Lancet Respiratory MedicineUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
3_David_CollingridgeSenior Publisher, LancetUK - London (London Wall)60000
3_David_CollingridgeEditor-in-Chief, The Lancet HaematologyUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
3_David_CollingridgeEditor-in-Chief, The Lancet Gastroenterology & HepatologyUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
3_David_CollingridgeSenior PublisherUK - London (London Wall)60000
4_Fiona_MacnabEditor-in-Chief, The Lancet Planetary HealthUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabEditor-in-Chief, The Lancet NeurologyUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabEditor-in-Chief, The Lancet PsychiatryUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabEditor-in-Chief, The Lancet MicrobeUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabEditor-in-Chief, The Lancet HIVUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabEditor-in-Chief, The Lancet Healthy LongevityUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabI&D Board Engagement DirectorUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabEditor-In-Chief, The Lancet Obstetrics, Gynaecology, & Women’s HealthUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabEditor-in-Chief, The Lancet Infectious DiseasesUK - London (London Wall)Editor-in-Chief65,000–70,000£67,500
4_Fiona_MacnabSenior Editor, The Lancet GroupUK - London (London Wall)Senior Editor40,000–50,000£47,500
5_Sabine_KleinertSenior Executive EditorUK - London (London Wall)Senior Executive Editor65,000–70,000£65,000.00
5_Sabine_KleinertSenior Executive EditorUK - London (London Wall)Senior Executive Editor65,000–70,000£65,000.00
5_Sabine_KleinertSenior Executive EditorUK - London (London Wall)Senior Executive Editor65,000–70,000£65,000.00
6_Simon_AndersonHead of MarketingUK - London (London Wall)65,000–70,000£65,000.00
6_Simon_AndersonHead of MultimediaUK - London (London Wall)65,000–70,000£65,000.00
6_Simon_AndersonHead of Media and CommunicationsUK - London (London Wall)65,000–70,000£65,000.00
6_Simon_AndersonSenior Product ManagerHome Based - United Kingdom 40,000–50,000£45,000
6_Simon_AndersonSenior Product ManagerUK - London (London Wall)50,000–60,000£55,000
8_Anna_ClarkSenior Editor, The Lancet RheumatologyUK - London (London Wall)Senior Editor40,000–50,000£47,500
8_Anna_ClarkDeputy Editor, The Lancet RheumatologyUK - London (London Wall)Deputy Editor50,000–60,000£55,000
9_Audrey_CeschiaActing Senior Editor, The Lancet Public HealthUK - London (London Wall)Senior Editor40,000–50,000£47,500
9_Audrey_CeschiaSenior Editor, The Lancet Public HealthUK - London (London Wall)Senior Editor40,000–50,000£47,500
10_Claudia_SchaferDeputy EditorUK - London (London Wall)Deputy Editor50,000–60,000£55,000
10_Claudia_SchaferSenior Editor eClinicalMedicineUK - London (London Wall)Senior Editor40,000–50,000£47,500
10_Claudia_SchaferSenior Editor, EClinicalMedicineUK - London (London Wall)Senior Editor40,000–50,000£47,500
10_Claudia_SchaferSenior Editor-The Lancet eClinicalMedicineUK - London (London Wall)Senior Editor40,000–50,000£47,500
10_Claudia_SchaferIn-House Senior Editor for eClinicalMedicineUK - London (London Wall)Senior Editor40,000–50,000£47,500
11_Esther_LauDeputy Editor, The Lancet Child & Adolescent HealthUK - London (London Wall)Deputy Editor50,000–60,000£55,000
12_Julie_StaceyDeputy Editor, eBioMedicineUK - London (London Wall)Deputy Editor50,000–60,000£55,000
13_Marta_KochDeputy EditorUK - London (London Wall)Deputy Editor50,000–60,000£55,000
13_Marta_KochSenior Editor, The Lancet Diabetes & EndocrinologyUK - London (London Wall)Senior Editor40,000–50,000£47,500
14_Pooja_JhaSenior Editor, The Lancet Regional Health - EuropeUK - London (London Wall)Senior Editor40,000–50,000£47,500
16_Yaiza_del_Pozo_MartinSenior Editor, The Lancet Primary CareUK - London (London Wall)Senior Editor40,000–50,000£47,500
16_Yaiza_del_Pozo_MartinIn-House Senior Editor, The Lancet Primary CareUK - London (London Wall)Senior Editor40,000–50,000£47,500
17_Zoe_MullanDeputy Editor, The Lancet Global HealthUK - London (London Wall)Deputy Editor50,000–60,000£55,000
17_Zoe_MullanPrint Content Mgmt Generalist IVUK - London (London Wall)Senior Editor40,000–50,000£47,500
17_Zoe_MullanActing Senior Editor, The Lancet Global HealthUK - London (London Wall)Senior Editor40,000–50,000£47,500
19_Bente_BrierleyDeputy Origination ManagerUK - London (London Wall)Deputy Origination Manager45,000–50,000£47,500
19_Bente_BrierleySenior Production EditorUK - London (London Wall)Senior Production Editor
19_Bente_BrierleyDeputy Origination ManagerUK - London (London Wall)Deputy Origination Manager45,000–50,000£47,500
19_Bente_BrierleySenior Production EditorUK - London (London Wall)Production Editor
19_Bente_BrierleyProduction AssistantUK - London (London Wall)Production Assistant30,000–35,00030,000
19_Bente_BrierleyProduction AssistantUK - London (London Wall)Production Assistant30,000–35,00030,000
19_Bente_BrierleySenior Quality ControllerHome Based - United KingdomSenior Quality Controller35,000
19_Bente_BrierleySenior Production EditorUK - London (London Wall)Senior Production Editor35,000–40,000
19_Bente_BrierleyProduction ControllerUK - London (London Wall)Production Controller
19_Bente_BrierleyProduction AssistantUK - London (London Wall)Production Assistant30,000–35,00030,000
21_Hannah_JonesSenior Deputy Managing EditorUK - London (London Wall)Senior Deputy Managing Editor50,000–55,000£52,250
21_Hannah_JonesSenior Deputy Managing EditorUK - London (London Wall)Senior Deputy Managing Editor50,000–55,000£52,250
21_Hannah_JonesDeputy Managing EditorUK - London (London Wall)Deputy Managing Editor45,000–50,000£47,500
21_Hannah_JonesSenior Deputy Managing EditorUK - London (London Wall)Senior Deputy Managing Editor50,000–55,000£52,250
21_Hannah_JonesSenior Deputy Managing EditorUK - London (London Wall)Senior Deputy Managing Editor50,000–55,000£52,250
22_Lucy_BanhamDeputy Managing EditorUK - London (London Wall)Deputy Managing Editor45,000–50,000£47,500
23_Marco_ConfortiAdministrative AssistantHome Based - United Kingdom 30,000
23_Marco_ConfortiEditorial AssistantUK - London (London Wall)30,000
23_Marco_ConfortiSenior Editorial AssistantUK - London (London Wall)£33,000
23_Marco_ConfortiEditorial AssistantUK - London (London Wall)30,000
23_Marco_ConfortiUK - London (London Wall)30,000
23_Marco_ConfortiSenior AdministratorUK - London (London Wall)£33,000
24_Valerie_WongContractor Analyst III ContractorUK - London (London Wall)30,000
24_Valerie_WongSenior Editorial AssistantUK - London (London Wall)£33,000
24_Valerie_WongEditorial AssistantUK - London (London Wall)30,000
24_Valerie_WongEditorial AssistantUK - London (London Wall)30,000
24_Valerie_WongEditorial AssistantUK - London (London Wall)30,000
24_Valerie_WongPayments AdministratorUK - London (London Wall)30,000
25_Ali_LandmanSenior Editor - The Lancet OncologyUK - London (London Wall)Senior Editor40,000–50,000£47,500
25_Ali_LandmanSenior EditorUK - London (London Wall)Senior Editor40,000–50,000£47,500
25_Ali_LandmanSenior EditorUK - London (London Wall)Senior Editor40,000–50,000£47,500
25_Ali_LandmanSenior Editor (at The Lancet Oncology)UK - London (London Wall)Senior Editor40,000–50,000£47,500
25_Ali_LandmanSenior Editor, The Lancet OncologyUK - London (London Wall)Senior Editor40,000–50,000£47,500
26_Emma_GraingerDeputy Editor, The Lancet Respiratory Medicine & Research Integrity Editor, The Lancet GroupUK - London (London Wall)Deputy Editor50,000–60,000£55,000
26_Emma_GraingerSenior Editor, The Lancet Respiratory MedicineUK - London (London Wall)Senior Editor40,000–50,000£47,500
28_Lan-Lan_SmithDeputy Editor, The Lancet HaematologyUK - London (London Wall)Deputy Editor50,000–60,000£55,000
29_Robert_BrierleySenior Editor, The Lancet Gastroenterology & HepatologyUK - London (London Wall)Senior Editor40,000–50,000£47,500
29_Robert_BrierleyDeputy Editor, The Lancet Gastroenterology & HepatologyUK - London (London Wall)Deputy Editor50,000–60,000£55,000
32_Alastair_BrownDeputy Manager, The Lancet Planetary HealthUK - London (London Wall)Deputy Editor50,000–60,000£55,000
34_Elena_Becker-BarrosoDeputy Editor, The Lancet NeurologyUK - London (London Wall)Deputy Editor50,000–60,000£55,000
36_Joan_MarshSenior Editor - Lancet PsychiatryUK - London (London Wall)Senior Editor40,000–50,000£47,500
37_Onisillos_SekkidesDeputy Editor, The Lancet MicrobeUK - London (London Wall)Deputy Editor50,000–60,000£55,000
37_Onisillos_SekkidesActing Senior Editor, The Lancet MicrobeUK - London (London Wall)Senior Editor40,000–50,000£47,500
37_Onisillos_SekkidesSenior Editor, The Lancet MicrobeUK - London (London Wall)Senior Editor40,000–50,000£47,500
38_Peter_HaywardSenior Editor, The Lancet HIVUK - London (London Wall)Senior Editor40,000–50,000£47,500
39_Philippa_HarrisActing Senior Editor, The Lancet Healthy LongevityUK - London (London Wall)Senior Editor40,000–50,000£47,500
39_Philippa_HarrisSenior Editor, The Lancet Healthy LongevityUK - London (London Wall)Senior Editor40,000–50,000£47,500
40_Rupa_SarkarDeputy Editor, The Lancet Digital HealthUK - London (London Wall)Deputy Editor50,000–60,000£55,000
40_Rupa_SarkarSenior EditorUK - London (London Wall)Senior Editor40,000–50,000£47,500
42_Sonia_MuliyilSenior Editor, The Lancet Obstetrics, Gynaecology, & Women’s HealthUK - London (London Wall)Senior Editor40,000–50,000£47,500
42_Sonia_MuliyilDeputy Editor, The Lancet Obstetrics, Gynaecology, & Women’s HealthUK - London (London Wall)Deputy Editor50,000–60,000£55,000
43_Ursula_HoferDeputy Editor, The Lancet Infectious DiseasesUK - London (London Wall)Deputy Editor50,000–60,000£55,000
46_Helen_FrankishSenior EditorUK - London (London Wall)Senior Editor40,000–50,000£47,500
46_Helen_FrankishSenior Editor - The LancetUK - London (London Wall)Senior Editor40,000–50,000£47,500
46_Helen_FrankishSenior EditorUK - London (London Wall)Senior Editor40,000–50,000£47,500
46_Helen_FrankishSenior Editor (Medical)UK - London (London Wall)Senior Editor (medical)
48_Pamela_DasExecutive Editor, The LancetUK - London (London Wall)Executive Editor
48_Pamela_DasExecutive EditorUK - London (London Wall)Executive Editor
48_Pamela_DasPrint Content Mgmt Generalist IVUK - London (London Wall)Senior Editor40,000–50,000£47,500
48_Pamela_DasExecutive Editor (Web)Home Based - United KingdomExecutive Editor
49_Vania_WisdomExecutive EditorUK - London (London Wall)Executive Editor
49_Vania_WisdomSenior Editor (Medical)UK - London (London Wall)Senior Editor (medical)
54_Laurie_PymSenior Marketing ManagerUK - London (London Wall)50,000–60,000£55,000
54_Laurie_PymAssociate Digital Marketing ManagerUK - London (London Wall)35,000–40,000£37,500
54_Laurie_PymMarketing ManagerUK - London (London Wall)40,000–50,000£45,000
54_Laurie_PymDigital Marketing ManagerUK - London (London Wall)40,000–50,000£45,000
54_Laurie_PymSenior Marketing Manager, The LancetUK - London (London Wall)50,000–60,000£55,000
54_Laurie_PymMarketing ManagerUK - London (London Wall)40,000–50,000£45,000
54_Laurie_PymDigital Marketing Manager, The Lancet GroupUK - London (London Wall)40,000–50,000£45,000
55_Leon_TernerSenior Infographics Designer & Producer (The Lancet)UK - London (London Wall)50,000–60,000
55_Leon_TernerMultimedia ProducerUK - London (London Wall)Senior illustrator40,000–45,000
56_Seil_CollinsMedia & Communications CoordinatorUK - London (London Wall)Media & Communications Coordinator35,000–40,000£37,500
56_Seil_CollinsSenior Media & Communications Manager, The LancetUK - London (London Wall)50,000-60,000£55,000
56_Seil_CollinsCommunications OfficerUK - London (London Wall)40,000–45,000£42,500
56_Seil_CollinsCommunications Manager (Social Media & Digital)UK - London (London Wall)45,000-50,000£47,500
56_Seil_CollinsInternal Communications ManagerUK - London (London Wall)45,000-50,000£47,500
64_Charlotte_RowbottomSenior Editor – eClinicalMedicine, The Lancet Discovery Science (12 months fixed term)UK - London (London Wall)Senior Editor40,000–50,000£47,500
71_Hannah_RalphSenior EditorHome Based - United KingdomSenior Editor40,000–50,000£47,500
71_Hannah_RalphSenior Editor (maternity cover)UK - London (London Wall)Senior Editor40,000–50,000£47,500
71_Hannah_RalphSenior Editor - The Lancet’s eBioMedicineHome Based - United KingdomSenior Editor40,000–50,000£47,500
71_Hannah_RalphSenior Editor, EBioMedicineUK - London (London Wall)Senior Editor40,000–50,000£47,500
71_Hannah_RalphSenior EditorUK - London (London Wall)Senior Editor40,000–50,000£47,500
88_Helen_BuddSenior IllustratorUK - London (London Wall)Senior Illustrator40,000–45,000
88_Helen_BuddProduction EditorUK - London (London Wall)Production Editor30,000–35,000
88_Helen_BuddSenior Production EditorUK - London (London Wall)Senior Production Editor35,000–40,000
88_Helen_BuddSenior Prodution EditorUK - London (London Wall)Senior Production Editor35,000–40,000
88_Helen_BuddProofreader/Quality ControllerUK - London (London Wall)Quality Controller30,000–35,000
88_Helen_BuddProduction EditorUK - London (London Wall)Production Editor30,000–35,000
90_Victoria_DennyProduction Editor - part time (4 days per week)UK - London (London Wall)Production Editor30,000–35,000
90_Victoria_DennyProduction Editor - part time (2.5 days per week)Home Based - United KingdomProduction Editor30,000–35,000
90_Victoria_DennyProduction EditorUK - London (London Wall)Production Editor30,000–35,000
90_Victoria_DennyIllustrator, The LancetUK - London (London Wall)Illustrator
90_Victoria_DennyProduction EditorUK - London (London Wall)Production Assistant30,000–35,00030,000
90_Victoria_DennySenior Quality ControllerUK - London (London Wall)Senior Quality Controller
98_Ashley_CooperSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
98_Ashley_CooperSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
98_Ashley_CooperSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
98_Ashley_CooperSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
98_Ashley_CooperSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK-Oxford (Nielsen House)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
99_Helen_PennySenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
100_Kayleigh_HookAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
100_Kayleigh_HookAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
100_Kayleigh_HookAssistant EditorUK-Oxford (Nielsen House)Assistant Editor35,000–40,000£37,500
100_Kayleigh_HookAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
100_Kayleigh_HookAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
100_Kayleigh_HookAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
100_Kayleigh_HookAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
100_Kayleigh_HookAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
101_Laura_PryceSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant EditorUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
102_Tim_DehnelSenior Assistant Editor, The Lancet JournalsUK - London (London Wall)Senior Assistant Editor40,000–45,000£42,500
103_Gabriella_MerryAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
103_Gabriella_MerryAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
103_Gabriella_MerryAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
103_Gabriella_MerryAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
103_Gabriella_MerryAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
103_Gabriella_MerryAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
103_Gabriella_MerryAssistant EditorUK - London (London Wall)Assistant Editor35,000–40,000£37,500
134_Laura_HartSenior Editor, The Lancet NeurologyUK - London (London Wall)Senior Editor40,000–50,000£47,500
153_Marco_De_AmbrogiSenior Editor, The Lancet Infectious DiseasesHome Based - United KingdomSenior Editor40,000–50,000£47,500
153_Marco_De_AmbrogiSenior Editor, The Lancet Infectious DiseasesUK - London (London Wall)Senior Editor40,000–50,000£47,500
`;

    const lines = rawText.trim().split('\n');
    const parsed = lines.map((line, idx) => {
      let salary = null;
      let isImputed = false;

      // Clean Text & Extract
      const currencyMatch = line.match(/£([\d,]+)/);
      if (currencyMatch) {
        salary = parseFloat(currencyMatch[1].replace(/,/g, ''));
      } else {
        const endNumberMatch = line.match(/(?<![–-])\b(\d{2,3},?\d{3})\s*$/);
        if (endNumberMatch) {
          salary = parseFloat(endNumberMatch[1].replace(/,/g, ''));
        }
      }

      if (!salary || isNaN(salary) || salary === 0) {
        salary = MEDIAN_IMPUTATION;
        isImputed = true;
      }

      let title = "Staff Role";
      const titleMatch = line.match(/(?:UK\s?-\s?London|Home Based|UK-Oxford).*?([A-Za-z\s&]+?)(?=\d|£|$)/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/\(London Wall\)/, '').trim();
      }

      return {
        id: idx,
        name: `Staff Member ${idx + 1}`,
        title: title || "Staff Role",
        salary: salary,
        isImputed: isImputed,
        hasBonus: detectBonus(title, salary)
      };
    });

    setData(parsed);
  }, []);

  const stats = useMemo(() => {
    let totalOld = 0;
    let totalNew = 0;
    let countUnderpin = 0;
    let countPercent = 0;
    
    const rows = data.map(emp => {
      const pctIncrease = emp.salary * (percent / 100);
      const increase = Math.max(pctIncrease, underpin);
      const newSalary = emp.salary + increase;
      const isUnderpin = increase === underpin;

      // Bonus Logic
      const oldBonus = (emp.hasBonus && includeBonuses) ? emp.salary * BONUS_RATE : 0;
      const newBonus = (emp.hasBonus && includeBonuses) ? newSalary * BONUS_RATE : 0;

      // Calculate TCOE versions
      const tcoeOld = calculateTCOE(emp.salary, oldBonus);
      const tcoeNew = calculateTCOE(newSalary, newBonus);
      const tcoeIncrease = tcoeNew - tcoeOld;

      if (includeTCOE) {
        totalOld += tcoeOld;
        totalNew += tcoeNew;
      } else {
        totalOld += emp.salary + oldBonus;
        totalNew += newSalary + newBonus;
      }

      if (isUnderpin) countUnderpin++; else countPercent++;

      return { 
        ...emp, newSalary, increase, isUnderpin,
        tcoeOld, tcoeNew, tcoeIncrease, oldBonus, newBonus
      };
    });

    return {
      totalOld, totalNew,
      totalIncrease: totalNew - totalOld,
      pctIncreaseTotal: totalOld ? ((totalNew - totalOld) / totalOld) * 100 : 0,
      countUnderpin, countPercent, rows
    };
  }, [data, underpin, percent, includeTCOE, includeBonuses]);

  // Individual Calculator
  const potUnderpin = underpin;
  const potPercent = testSalary * (percent / 100);
  const indIncrease = Math.max(potPercent, potUnderpin);
  const indNew = parseFloat(testSalary) + indIncrease;
  
  // Individual TCOE (Base + No Bonus for simplicity)
  const indPension = indNew * PENSION_RATE;
  const indNI = Math.max(0, indNew - NI_THRESHOLD) * NI_RATE;
  const indLevy = indNew * APP_LEVY_RATE;
  const indTotalTCOE = indNew + indPension + indNI + indLevy;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Scenario Configuration
          </h2>
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-lg border border-slate-200">
                <span className={`text-xs font-bold ${includeTCOE ? 'text-slate-400' : 'text-blue-600'}`}>Gross Pay</span>
                <button 
                    onClick={() => setIncludeTCOE(!includeTCOE)}
                    className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-300 data-[checked=true]:bg-blue-600 transition-colors"
                    data-checked={includeTCOE}
                >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${includeTCOE ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-xs font-bold ${includeTCOE ? 'text-blue-600' : 'text-slate-400'}`}>Total Cost (TCOE)</span>
             </div>
             <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 cursor-pointer select-none" onClick={() => setIncludeBonuses(!includeBonuses)}>
                    Include 10% Bonuses?
                </label>
                <button 
                    onClick={() => setIncludeBonuses(!includeBonuses)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${includeBonuses ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'}`}
                >
                    {includeBonuses && <span className="text-[10px]">✓</span>}
                </button>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Underpin Amount (£)</label>
            <input type="number" value={underpin} onChange={(e) => setUnderpin(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Percentage Increase (%)</label>
            <input type="number" value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`p-4 border-l-4 ${includeTCOE ? 'border-indigo-500 bg-indigo-50' : 'border-blue-500'}`}>
          <div className="text-slate-500 text-sm mb-1">{includeTCOE ? "Total Cost (TCOE)" : "Total Gross Pay"}</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(stats.totalOld)}</div>
        </Card>
        <Card className={`p-4 border-l-4 ${includeTCOE ? 'border-indigo-500 bg-indigo-50' : 'border-green-500'}`}>
          <div className="text-slate-500 text-sm mb-1">{includeTCOE ? "New Cost (TCOE)" : "New Gross Pay"}</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(stats.totalNew)}</div>
        </Card>
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="text-slate-500 text-sm mb-1">Net Cost Increase</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(stats.totalIncrease)}</div>
          <div className="text-sm font-medium text-amber-600 mt-1">+{stats.pctIncreaseTotal.toFixed(2)}%</div>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <div className="text-slate-500 text-sm mb-1">Staff Impact</div>
          <div className="flex justify-between items-end mt-2">
            <div className="text-xs text-center"><div className="font-bold text-lg">{stats.countUnderpin}</div><div className="text-slate-400">Underpin</div></div>
            <div className="text-xs text-center"><div className="font-bold text-lg">{stats.countPercent}</div><div className="text-slate-400">Percentage</div></div>
          </div>
        </Card>
      </div>

      {/* Individual Check */}
      <Card className="p-6 border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Calculator size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Individual Check</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">My Base Salary</label>
              <input type="number" value={testSalary} onChange={(e) => setTestSalary(Number(e.target.value))} className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className={`flex justify-between text-sm ${potUnderpin >= potPercent ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                <span>Option A (Underpin):</span><span>+{fmt(potUnderpin)}</span>
              </div>
              <div className={`flex justify-between text-sm ${potPercent > potUnderpin ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                <span>Option B ({percent}%):</span><span>+{fmt(potPercent)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-600 font-medium">New Gross Salary:</span>
                <span className="font-bold text-slate-800">{fmt(indNew)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-md mt-2 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Employer Cost Breakdown (New)</div>
                <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Pension (11%):</span><span>{fmt(indPension)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Employer NI (15%):</span><span>{fmt(indNI)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Levy (0.5%):</span><span>{fmt(indLevy)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                    <span className="text-slate-800 font-bold text-xs">Total Cost to Company:</span>
                    <span className="font-bold text-slate-900 text-sm">{fmt(indTotalTCOE)}</span>
                </div>
              </div>
            </div>
          </div>
      </Card>

      {/* Staff Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Table2 size={18} /> Staff List ({data.length})</h3>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-medium sticky top-0">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Title</th>
                <th className="p-3 text-right">Current</th>
                <th className="p-3 text-right">Increase</th>
                <th className="p-3 text-right">New</th>
                <th className="p-3 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.rows.sort((a,b) => b.increase - a.increase).map((row, idx) => {
                 const displaySalary = includeTCOE ? row.tcoeOld : (row.salary + (includeBonuses ? row.oldBonus : 0));
                 const displayGrossIncrease = (row.newSalary + (includeBonuses ? row.newBonus : 0)) - (row.salary + (includeBonuses ? row.oldBonus : 0));
                 const finalDisplayIncrease = includeTCOE ? row.tcoeIncrease : displayGrossIncrease;
                 const displayNew = includeTCOE ? row.tcoeNew : (row.newSalary + (includeBonuses ? row.newBonus : 0));

                 return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-700 flex items-center gap-2">
                        {row.name}
                        {row.hasBonus && includeBonuses && <Coins size={12} className="text-amber-500" title="Bonus Eligible" />}
                    </td>
                    <td className="p-3 text-slate-500 truncate max-w-xs">{row.title}</td>
                    <td className="p-3 text-right font-mono">{fmt(displaySalary)}</td>
                    <td className={`p-3 text-right font-mono ${includeTCOE ? 'text-amber-700' : 'text-green-600'}`}>+{fmt(finalDisplayIncrease)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700">{fmt(displayNew)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${row.isUnderpin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {row.isUnderpin ? 'Underpin' : `${percent}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- Sub-Component: Break-Even Visualizer ---
const BreakEvenVisualizer = () => {
  const [underpin, setUnderpin] = useState(3000);
  const [percent, setPercent] = useState(8);
  const [userSalary, setUserSalary] = useState(45000);

  const breakEvenSalary = percent > 0 ? underpin / (percent / 100) : 0;
  const userPctIncrease = userSalary * (percent / 100);
  const userIncrease = Math.max(underpin, userPctIncrease);
  const isUnderpinBetter = underpin >= userPctIncrease;

  const maxSalary = 100000;
  const maxIncrease = 12000;
  const width = 800;
  const height = 400;
  const padding = 60;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const plotX = (salary) => padding + (salary / maxSalary) * graphWidth;
  const plotY = (increase) => (height - padding) - (increase / maxIncrease) * graphHeight;

  const lineUnderpinY = plotY(underpin);
  const linePercentEnd = plotY(maxSalary * (percent / 100));
  const breakEvenX = plotX(breakEvenSalary);
  const breakEvenY = plotY(underpin);
  const userX = plotX(userSalary);
  const userY = plotY(userIncrease);

  const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit space-y-8">
          <div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-4">
            <TrendingUp size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Parameters</h2>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-medium text-slate-700">Underpin Amount</label>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{fmt(underpin)}</span>
            </div>
            <input type="range" min="0" max="10000" step="100" value={underpin} onChange={(e) => setUnderpin(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-medium text-slate-700">Percentage Increase</label>
              <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded">{percent}%</span>
            </div>
            <input type="range" min="0.5" max="20" step="0.5" value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
          </div>
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-purple-600">
                <User size={20} />
                <h3 className="font-bold text-slate-800">Check Your Position</h3>
            </div>
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">My Salary</label>
                <input type="number" value={userSalary} onChange={(e) => setUserSalary(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className={`flex justify-between items-center p-2 rounded text-sm transition-colors ${isUnderpinBetter ? 'bg-purple-100 border border-purple-200 text-purple-900 font-bold shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                    <span>Option A (Underpin):</span><span>+{fmt(underpin)}</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded text-sm transition-colors ${!isUnderpinBetter ? 'bg-purple-100 border border-purple-200 text-purple-900 font-bold shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                    <span>Option B ({percent}%):</span><span>+{fmt(userPctIncrease)}</span>
                </div>
            </div>
            <div className="mt-4 text-center p-3 bg-slate-50 rounded border border-slate-100">
                 <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">You Receive</div>
                 <div className="text-2xl font-bold text-purple-700">+{fmt(userIncrease)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 overflow-hidden flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-slate-800 w-full mb-4">Visualizing the Trade-off</h2>
          <div className="relative w-full overflow-x-auto">
            <svg width={width} height={height} className="border border-slate-100 bg-white shadow-sm rounded">
              {[0, 2500, 5000, 7500, 10000, 12500].map(val => (val <= maxIncrease && (<g key={val}><line x1={padding} y1={plotY(val)} x2={width - padding} y2={plotY(val)} stroke="#e2e8f0" strokeDasharray="4 4" /><text x={padding - 10} y={plotY(val) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">£{val}</text></g>)))}
              {[0, 25000, 50000, 75000, 100000].map(val => (<g key={val}><line x1={plotX(val)} y1={padding} x2={plotX(val)} y2={height - padding} stroke="#e2e8f0" strokeDasharray="4 4" /><text x={plotX(val)} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#94a3b8">£{val/1000}k</text></g>))}
              <text x={width / 2} y={height - 15} textAnchor="middle" fill="#475569" fontWeight="bold" fontSize="12">Base Salary (£)</text>
              <text x={15} y={height / 2} textAnchor="middle" fill="#475569" fontWeight="bold" fontSize="12" transform={`rotate(-90, 15, ${height / 2})`}>Increase Amount (£)</text>
              <line x1={padding} y1={lineUnderpinY} x2={width - padding} y2={lineUnderpinY} stroke="#2563eb" strokeWidth="3" />
              <text x={width - padding + 5} y={lineUnderpinY + 4} fill="#2563eb" fontSize="11" fontWeight="bold">Underpin</text>
              <line x1={padding} y1={plotY(0)} x2={plotX(maxSalary)} y2={linePercentEnd} stroke="#16a34a" strokeWidth="3" />
              <text x={plotX(maxSalary) + 5} y={linePercentEnd} fill="#16a34a" fontSize="11" fontWeight="bold">% Inc</text>
              {breakEvenSalary <= maxSalary && (<g><circle cx={breakEvenX} cy={breakEvenY} r="6" fill="#dc2626" stroke="white" strokeWidth="2" /><text x={breakEvenX} y={breakEvenY - 15} textAnchor="middle" fill="#dc2626" fontWeight="bold" fontSize="12">{fmt(breakEvenSalary)}</text></g>)}
              {userSalary <= maxSalary && (<g><line x1={userX} y1={userY} x2={userX} y2={height - padding} stroke="#9333ea" strokeDasharray="3 3" strokeWidth="2" opacity="0.5" /><circle cx={userX} cy={userY} r="8" fill="#9333ea" stroke="white" strokeWidth="2" /><g transform={`translate(${userX}, ${userY - 40})`}><rect x="-50" y="0" width="100" height="30" rx="4" fill="#9333ea" /><text x="0" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">You: {fmt(userIncrease)}</text><polygon points="-5,30 5,30 0,35" fill="#9333ea" /></g></g>)}
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [activeTab, setActiveTab] = useState('modeler');

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Union Pay Calculator</h1>
          <p className="text-slate-600">Cost modeling and break-even analysis for 2025 pay claim.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('modeler')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'modeler' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Table2 size={16} /> Salary Modeler
          </button>
          <button 
            onClick={() => setActiveTab('visualizer')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'visualizer' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart3 size={16} /> Break-Even Graph
          </button>
        </div>

        {/* Content */}
        {activeTab === 'modeler' ? <SalaryModeler /> : <BreakEvenVisualizer />}
      </div>
    </div>
  );
};

export default App;