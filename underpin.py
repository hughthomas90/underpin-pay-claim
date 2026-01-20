import streamlit as st
import pandas as pd
import re
import altair as alt

# --- CONFIGURATION ---
st.set_page_config(page_title="Union Pay Claim Modeler", layout="wide")

# --- DATA ---
RAW_DATA = """
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
"""

# --- CONSTANTS ---
NI_RATE = 0.15          # 15% Employer NI (April 2025)
NI_THRESHOLD = 5000     # £5,000 threshold (April 2025)
PENSION_RATE = 0.11     # 11% Pension
APP_LEVY_RATE = 0.005   # 0.5% Levy
BONUS_RATE = 0.10       # 10% Bonus
MEDIAN_IMPUTATION = 47500

# --- FUNCTIONS ---

def detect_bonus(title, salary):
    """
    Returns True if role is eligible for bonus.
    Rule 1: Salary >= £55,000
    Rule 2: Title contains 'Senior Editor', 'Chief', 'Manager', 'Head', etc.
    """
    if not title:
        return False
    
    # 1. Salary Rule
    if salary and salary >= 55000:
        return True
        
    t = str(title).lower()
    
    # 2. Title Rules
    if 'senior editor' in t: return True
    if 'chief' in t: return True
    if any(x in t for x in ['manager', 'head', 'director', 'publisher']): return True
    
    return False

def clean_money(val):
    if not val: return 0.0
    # Remove currency symbol, commas
    clean = re.sub(r'[£,]', '', str(val))
    # Extract numeric part if mixed with text
    match = re.search(r'(\d+)', clean)
    if match:
        return float(match.group(1))
    return 0.0

@st.cache_data
def load_data():
    lines = RAW_DATA.strip().split('\n')
    parsed_data = []
    
    for i, line in enumerate(lines):
        if not line.strip(): continue
        
        # Simple extraction logic tailored to this specific messy text format
        # 1. Extract Salary (looking for £... or big numbers at end)
        salary = 0.0
        is_imputed = False
        
        # Try finding £XXXXX
        money_match = re.search(r'£([\d,]+)', line)
        if money_match:
            salary = float(money_match.group(1).replace(',', ''))
        else:
            # Look for numbers at end of string that look like salaries (e.g. 30000)
            # Avoid ranges like 40,000-50,000 by checking for end of line
            end_match = re.search(r'(?<![–-])\b(\d{2,3},?\d{3})\s*$', line)
            if end_match:
                salary = float(end_match.group(1).replace(',', ''))
        
        if salary == 0 or pd.isna(salary):
            salary = MEDIAN_IMPUTATION
            is_imputed = True
            
        # 2. Extract Title (Approximate)
        # Look for text between Location and Salary
        # Common locations in data: "UK - London", "Home Based"
        title = "Staff Role"
        # Regex looks for "UK..." then captures text until a number or £ starts
        title_match = re.search(r'(?:UK\s?-\s?London|Home Based|UK-Oxford).*?([A-Za-z\s&]+?)(?=\d|£|$)', line)
        if title_match:
            title = title_match.group(1).replace('(London Wall)', '').strip()
            
        has_bonus = detect_bonus(title, salary)
        
        parsed_data.append({
            "Name": f"Staff Member {i+1}",
            "Title": title,
            "Salary": salary,
            "IsImputed": is_imputed,
            "HasBonus": has_bonus
        })
        
    return pd.DataFrame(parsed_data)

def calculate_tcoe(base_salary, bonus_amount=0):
    # Pension on BASE only
    pension = base_salary * PENSION_RATE
    
    # NI and Levy on TOTAL cash
    total_earnings = base_salary + bonus_amount
    niable = max(0, total_earnings - NI_THRESHOLD)
    ni = niable * NI_RATE
    levy = total_earnings * APP_LEVY_RATE
    
    return base_salary + bonus_amount + pension + ni + levy

def fmt_gbp(val):
    return f"£{val:,.0f}"

# --- APP LAYOUT ---

df = load_data()

tab1, tab2 = st.tabs(["💰 Salary Modeler", "📈 Break-Even Graph"])

# ==============================================================================
# TAB 1: SALARY MODELER
# ==============================================================================
with tab1:
    st.title("Pay Claim Modeler")
    st.markdown("Simulate **Underpin** vs **Percentage** increases across the staff group.")
    
    # -- Controls --
    with st.expander("⚙️ Scenario Configuration", expanded=True):
        col1, col2, col3 = st.columns(3)
        with col1:
            underpin_val = st.number_input("Underpin Amount (£)", value=3000, step=100)
        with col2:
            percent_val = st.number_input("Percentage Increase (%)", value=8.0, step=0.5)
        with col3:
            st.markdown("##### Toggles")
            show_tcoe = st.checkbox("Show Total Cost (TCOE)", help="Include Pension, NI (15%), Levy")
            include_bonus = st.checkbox("Include Bonuses", help="Add 10% bonus for eligible staff")

    # -- Logic --
    # Calculate rows
    results = []
    total_old = 0
    total_new = 0
    count_underpin = 0
    count_percent = 0
    
    for index, row in df.iterrows():
        base_salary = row['Salary']
        
        # Pay Rise Logic
        pct_increase = base_salary * (percent_val / 100.0)
        increase_val = max(pct_increase, underpin_val)
        new_base = base_salary + increase_val
        is_underpin = (increase_val == underpin_val)
        
        # Bonus Logic
        old_bonus = (base_salary * BONUS_RATE) if (row['HasBonus'] and include_bonus) else 0
        new_bonus = (new_base * BONUS_RATE) if (row['HasBonus'] and include_bonus) else 0
        
        # Cost Calculation (Gross vs TCOE)
        if show_tcoe:
            cost_old = calculate_tcoe(base_salary, old_bonus)
            cost_new = calculate_tcoe(new_base, new_bonus)
        else:
            cost_old = base_salary + old_bonus
            cost_new = new_base + new_bonus
            
        diff = cost_new - cost_old
        
        total_old += cost_old
        total_new += cost_new
        if is_underpin: count_underpin += 1
        else: count_percent += 1
        
        results.append({
            "Name": row['Name'],
            "Title": row['Title'],
            "Current": cost_old,
            "Increase": diff,
            "New": cost_new,
            "Type": "Underpin" if is_underpin else f"{percent_val}%",
            "Imputed": row['IsImputed'],
            "Bonus": row['HasBonus'] and include_bonus
        })
        
    df_results = pd.DataFrame(results)
    
    # -- Metrics --
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Current Bill", fmt_gbp(total_old), delta="Base" if not show_tcoe else "TCOE")
    m2.metric("Total New Bill", fmt_gbp(total_new))
    m3.metric("Net Cost Increase", fmt_gbp(total_new - total_old), 
              delta=f"{((total_new - total_old)/total_old)*100:.1f}%")
    m4.metric("Staff on Underpin", f"{count_underpin}", help=f"Remaining {count_percent} are on %")

    # -- Warning Box --
    if show_tcoe:
        st.warning(f"⚠️ **TCOE Active:** 15% NI (>£{NI_THRESHOLD}), 0.5% Levy, 11% Pension (Base only).")

    # -- Data Table --
    st.subheader(f"Staff List ({len(df_results)})")
    
    # Formatting for display
    display_df = df_results.copy()
    display_df['Current'] = display_df['Current'].apply(fmt_gbp)
    display_df['New'] = display_df['New'].apply(fmt_gbp)
    display_df['Increase'] = display_df['Increase'].apply(lambda x: f"+{fmt_gbp(x)}")
    display_df['Name'] = display_df.apply(lambda r: f"{r['Name']} {'💰' if r['Bonus'] else ''}", axis=1)
    
    st.dataframe(
        display_df[['Name', 'Title', 'Current', 'Increase', 'New', 'Type']], 
        use_container_width=True,
        hide_index=True
    )
    
    # -- Individual Checker --
    st.markdown("---")
    st.subheader("🧮 Individual Check")
    
    ic_col1, ic_col2 = st.columns([1, 2])
    with ic_col1:
        my_salary = st.number_input("My Base Salary", value=55000, step=500)
    
    with ic_col2:
        # Calculate Individual
        ind_pct_val = my_salary * (percent_val / 100.0)
        ind_inc = max(underpin_val, ind_pct_val)
        ind_new_base = my_salary + ind_inc
        
        # Individual TCOE stats
        # Assuming NO Bonus for the generic calculator unless we add a toggle, 
        # but prompt asked to show Employer Cost breakdown.
        
        ind_pension = ind_new_base * PENSION_RATE
        ind_ni = max(0, ind_new_base - NI_THRESHOLD) * NI_RATE
        ind_levy = ind_new_base * APP_LEVY_RATE
        ind_total_cost = ind_new_base + ind_pension + ind_ni + ind_levy
        
        st.markdown(f"""
        **New Gross Salary:** :green[{fmt_gbp(ind_new_base)}]  
        *(Increase: {fmt_gbp(ind_inc)} via {'Underpin' if ind_inc == underpin_val else 'Percentage'})*
        
        **Employer Cost Breakdown (New):**
        * Pension (11%): {fmt_gbp(ind_pension)}
        * NI (15%): {fmt_gbp(ind_ni)}
        * Levy (0.5%): {fmt_gbp(ind_levy)}
        * **Total Cost to Company:** :red[{fmt_gbp(ind_total_cost)}]
        """)


# ==============================================================================
# TAB 2: BREAK-EVEN GRAPH
# ==============================================================================
with tab2:
    st.title("Break-Even Visualizer")
    
    # -- Controls --
    g_col1, g_col2, g_col3 = st.columns(3)
    with g_col1:
        g_underpin = st.slider("Underpin (£)", 0, 10000, 3000, 100)
    with g_col2:
        g_percent = st.slider("Percentage (%)", 0.5, 20.0, 8.0, 0.5)
    with g_col3:
        g_salary = st.number_input("Check My Salary", value=45000, step=1000)

    # -- Logic --
    break_even = g_underpin / (g_percent / 100.0)
    
    # Generate Data for Plot
    max_x = 100000
    x_vals = range(0, max_x + 5000, 5000)
    plot_data = []
    
    for x in x_vals:
        plot_data.append({"Salary": x, "Amount": g_underpin, "Type": "Underpin"})
        plot_data.append({"Salary": x, "Amount": x * (g_percent/100.0), "Type": "Percentage"})
        
    chart_df = pd.DataFrame(plot_data)
    
    # -- Chart --
    base = alt.Chart(chart_df).encode(
        x=alt.X('Salary', axis=alt.Axis(format='£s', title='Base Salary')),
        y=alt.Y('Amount', axis=alt.Axis(format='£s', title='Increase Amount')),
        color='Type'
    )
    
    lines = base.mark_line(strokeWidth=3)
    
    # User Marker
    user_inc = max(g_underpin, g_salary * (g_percent/100.0))
    user_df = pd.DataFrame([{"Salary": g_salary, "Amount": user_inc, "Label": "You"}])
    
    user_point = alt.Chart(user_df).mark_circle(size=200, color='red').encode(
        x='Salary', y='Amount', tooltip=['Salary', 'Amount']
    )
    
    # Final Chart
    final_chart = (lines + user_point).properties(height=400)
    
    st.altair_chart(final_chart, use_container_width=True)
    
    # -- Explanation --
    st.info(f"""
    **Break-Even Point:** {fmt_gbp(break_even)}
    
    * If you earn **less** than {fmt_gbp(break_even)}, you are better off with the **Underpin**.
    * If you earn **more** than {fmt_gbp(break_even)}, you are better off with the **Percentage**.
    """)
    
    # -- Individual Result Box --
    user_pct_inc = g_salary * (g_percent/100.0)
    better_option = "Underpin" if g_underpin >= user_pct_inc else "Percentage"
    
    st.success(f"""
    **For a salary of {fmt_gbp(g_salary)}:**
    * Underpin gives: **{fmt_gbp(g_underpin)}**
    * {g_percent}% gives: **{fmt_gbp(user_pct_inc)}**
    
    👉 You receive **{fmt_gbp(user_inc)}** (via {better_option})
    """)
