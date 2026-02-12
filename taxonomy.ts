import { CISSPDomain } from "./types";

/**
 * CISSP domain → sub-topic taxonomy.
 * Used to guide Gemini toward specific topics and track coverage.
 */
export const DOMAIN_TOPICS: Record<CISSPDomain, string[]> = {
  [CISSPDomain.SecurityAndRiskManagement]: [
    "CIA triad and security governance",
    "Risk assessment methodologies (quantitative vs qualitative)",
    "Risk treatment strategies (avoid, transfer, mitigate, accept)",
    "Security policies, standards, and procedures",
    "Business continuity planning (BCP)",
    "Disaster recovery planning (DRP)",
    "Legal and regulatory compliance (GDPR, HIPAA, SOX)",
    "Intellectual property protection",
    "Professional ethics and (ISC)² Code of Ethics",
    "Personnel security (hiring, termination, NDA)",
    "Threat modeling frameworks (STRIDE, PASTA, DREAD)",
    "Supply chain risk management",
    "Security awareness and training programs",
    "Third-party governance and vendor risk",
    "Data privacy principles and frameworks",
    "Security control frameworks (NIST, ISO 27001, COBIT)",
    "Risk appetite and risk tolerance",
    "Business impact analysis (BIA)",
    "Organizational roles and responsibilities (CISO, DPO)",
  ],

  [CISSPDomain.AssetSecurity]: [
    "Data classification schemes",
    "Data ownership roles (owner, custodian, steward)",
    "Data lifecycle management",
    "Data retention and disposal policies",
    "Data remanence and secure destruction",
    "Asset inventory and management",
    "Data states (at rest, in transit, in use)",
    "Privacy-enhancing technologies (PET)",
    "Data loss prevention (DLP) strategies",
    "Media handling and sanitization (NIST 800-88)",
    "Information labeling and marking",
    "PII and PHI protection requirements",
    "Scoping and tailoring security controls to assets",
    "Cloud data sovereignty and jurisdictional issues",
    "Digital rights management (DRM)",
  ],

  [CISSPDomain.SecurityArchitectureAndEngineering]: [
    "Security models (Bell-LaPadula, Biba, Clark-Wilson)",
    "Security evaluation criteria (Common Criteria, TCSEC)",
    "Trusted computing base (TCB) and security perimeters",
    "Cryptographic algorithms (AES, RSA, ECC)",
    "Public key infrastructure (PKI) and certificate management",
    "Hash functions and digital signatures",
    "Symmetric vs asymmetric encryption use cases",
    "Secure system design principles (least privilege, defense in depth)",
    "Database security (inference, aggregation, polyinstantiation)",
    "IoT and embedded systems security",
    "Cloud computing security architecture (IaaS, PaaS, SaaS)",
    "Industrial control systems (ICS/SCADA) security",
    "Virtualization and hypervisor security",
    "Hardware security modules (HSM) and TPM",
    "Side-channel attacks and countermeasures",
    "Memory protection mechanisms (ASLR, DEP, NX bit)",
    "Microservices and containerization security",
    "Zero trust architecture principles",
    "Key management lifecycle",
    "Cryptanalysis and cipher weaknesses",
  ],

  [CISSPDomain.CommunicationAndNetworkSecurity]: [
    "OSI and TCP/IP model security implications",
    "Network segmentation and micro-segmentation",
    "Firewall types and architectures (stateful, next-gen, WAF)",
    "VPN technologies (IPsec, SSL/TLS, WireGuard)",
    "Wireless security protocols (WPA3, 802.1X)",
    "DNS security (DNSSEC, DNS over HTTPS)",
    "Email security (SPF, DKIM, DMARC, S/MIME)",
    "Network access control (NAC) and 802.1X",
    "DDoS mitigation strategies",
    "Intrusion detection and prevention (IDS/IPS)",
    "Software-defined networking (SDN) security",
    "Content delivery networks and edge security",
    "Secure remote access and zero trust network access",
    "Network protocol vulnerabilities and hardening",
    "TLS/SSL handshake and certificate validation",
    "Network traffic analysis and flow monitoring",
    "IPv6 security considerations",
    "Secure network design patterns (DMZ, bastion hosts)",
  ],

  [CISSPDomain.IdentityAndAccessManagement]: [
    "Authentication factors and multifactor authentication",
    "Single sign-on (SSO) and federation (SAML, OAuth, OIDC)",
    "Identity lifecycle management (provisioning, deprovisioning)",
    "Access control models (DAC, MAC, RBAC, ABAC)",
    "Privileged access management (PAM)",
    "Identity as a Service (IDaaS) and directory services",
    "Biometric authentication systems",
    "Kerberos authentication protocol",
    "RADIUS and TACACS+ protocols",
    "Just-in-time access and least privilege enforcement",
    "Session management and token handling",
    "Credential management and password policies",
    "Risk-based and adaptive authentication",
    "Account lockout and brute-force protections",
    "Identity governance and access certification",
    "Service accounts and machine identity management",
  ],

  [CISSPDomain.SecurityAssessmentAndTesting]: [
    "Vulnerability assessment methodologies",
    "Penetration testing types (black, white, gray box)",
    "Security audit standards (SOC 1/2/3, ISO 27001 audits)",
    "Log management and SIEM correlation",
    "Software testing (SAST, DAST, IAST, fuzzing)",
    "Code review and static analysis techniques",
    "Security metrics and key risk indicators (KRI)",
    "Compliance and regulatory testing",
    "Red team vs blue team vs purple team exercises",
    "Social engineering assessments",
    "Security control validation and testing schedules",
    "Breach and attack simulation (BAS)",
    "Third-party and supply chain assessments",
    "Test coverage analysis and reporting",
    "Continuous monitoring and automated scanning",
  ],

  [CISSPDomain.SecurityOperations]: [
    "Incident response lifecycle (NIST SP 800-61)",
    "Digital forensics and evidence handling (chain of custody)",
    "Security operations center (SOC) operations",
    "Change and configuration management",
    "Patch management strategies",
    "Logging, monitoring, and alerting",
    "Disaster recovery strategies (hot, warm, cold sites)",
    "Backup types and restoration testing",
    "Business continuity testing and exercises",
    "Malware analysis and threat intelligence",
    "Physical security controls (access control, surveillance)",
    "Endpoint detection and response (EDR)",
    "Security orchestration, automation, and response (SOAR)",
    "Service level agreements and operational resilience",
    "Investigations and e-discovery processes",
    "Personnel safety and travel security",
    "Resource provisioning and deprovisioning",
    "Vulnerability management lifecycle",
  ],

  [CISSPDomain.SoftwareDevelopmentSecurity]: [
    "Secure SDLC methodologies (Agile, DevSecOps)",
    "OWASP Top 10 web application vulnerabilities",
    "Input validation and output encoding",
    "SQL injection and prevention techniques",
    "Cross-site scripting (XSS) and CSRF defenses",
    "Secure coding standards and guidelines",
    "Software composition analysis (SCA) and dependency management",
    "API security and authentication",
    "Buffer overflow prevention techniques",
    "Security in CI/CD pipelines",
    "Secure code review practices",
    "Software acquisition and third-party code risks",
    "Database activity monitoring and security",
    "Malicious code and backdoor prevention",
    "Maturity models (CMMI, BSIMM, SAMM)",
    "Runtime application self-protection (RASP)",
    "Threat modeling in software development",
  ],
};

/** Flat list of all topics for convenience */
const ALL_TOPICS = Object.entries(DOMAIN_TOPICS).flatMap(([domain, topics]) =>
  topics.map((topic) => ({ domain, topic }))
);

export interface TopicAssignment {
  domain: string;
  topic: string;
}

/**
 * Select uncovered topics for the next batch of questions.
 * Picks topics the user hasn't seen yet; wraps around when all are exhausted.
 */
export function selectUncoveredTopics(
  count: number,
  coveredTopics: string[] = []
): TopicAssignment[] {
  const coveredSet = new Set(coveredTopics);

  // Filter to uncovered topics
  let pool = ALL_TOPICS.filter((t) => !coveredSet.has(t.topic));

  // Wraparound: if not enough uncovered, reset and use the full pool
  if (pool.length < count) {
    pool = [...ALL_TOPICS];
  }

  // Shuffle using Fisher-Yates
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  return shuffled.slice(0, count);
}
