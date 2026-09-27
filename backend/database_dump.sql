--
-- PostgreSQL database dump
--

\restrict JfEb38uTywXmsdR20YbROgzkuVgeQEUKsKMR9d0FwjK2ZO9h3Hsdu3TV02GM0Am

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agency_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agency_settings (
    id integer NOT NULL,
    name character varying DEFAULT 'Concepto Evt'::character varying NOT NULL,
    phone character varying DEFAULT ''::character varying NOT NULL,
    slogan character varying DEFAULT 'Viajá con quien sabe'::character varying NOT NULL,
    "colorPrimary" character varying DEFAULT '#1e3a5f'::character varying NOT NULL,
    "colorAccent" character varying DEFAULT '#f97316'::character varying NOT NULL,
    "logoFullUrl" character varying,
    "logoCompactUrl" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.agency_settings OWNER TO postgres;

--
-- Name: agency_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agency_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agency_settings_id_seq OWNER TO postgres;

--
-- Name: agency_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agency_settings_id_seq OWNED BY public.agency_settings.id;


--
-- Name: booking_file; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_file (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tenantId" character varying,
    "clientId" uuid,
    destination character varying,
    "travelDates" character varying,
    "totalPrice" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying DEFAULT 'USD'::character varying NOT NULL,
    status character varying DEFAULT 'OPEN'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.booking_file OWNER TO postgres;

--
-- Name: circuit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.circuit (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    codigo_circuito character varying,
    nombre character varying,
    duracion text,
    paises_visitados text,
    ciudades_itinerario text,
    meses_operacion text,
    precio_base_eur numeric(10,2),
    itinerario_resumido text,
    hoteles_previstos text,
    operator character varying,
    destination character varying NOT NULL,
    title character varying,
    duration character varying,
    price character varying,
    currency character varying,
    dates character varying,
    inclusions text,
    exclusions text,
    "rawText" text,
    categoria character varying,
    "sourceFile" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "webCategory" character varying,
    "imageUrl" character varying,
    tags text,
    highlights text,
    "whatsappMessage" text,
    "flyerData" text
);


ALTER TABLE public.circuit OWNER TO postgres;

--
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    email character varying,
    phone character varying,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.client OWNER TO postgres;

--
-- Name: destination; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    country character varying,
    description text,
    "iataCode" character varying(3),
    "imageUrl" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.destination OWNER TO postgres;

--
-- Name: destination_asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_asset (
    id integer NOT NULL,
    destination character varying NOT NULL,
    "imageUrl" character varying NOT NULL,
    "publicId" character varying,
    "hotelName" character varying,
    "isDefault" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.destination_asset OWNER TO postgres;

--
-- Name: destination_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destination_asset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destination_asset_id_seq OWNER TO postgres;

--
-- Name: destination_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destination_asset_id_seq OWNED BY public.destination_asset.id;


--
-- Name: experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experience (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    subtitle character varying,
    slug character varying,
    category character varying DEFAULT 'SPORTS'::character varying NOT NULL,
    "hostName" character varying,
    "hostTitle" character varying,
    "hostBio" text,
    description text NOT NULL,
    "shortDescription" text,
    "imageUrl" character varying,
    "videoUrl" character varying,
    gallery text,
    location character varying,
    duration character varying,
    "availableDates" character varying,
    "availabilityMode" character varying DEFAULT 'ON_REQUEST'::character varying NOT NULL,
    "minGuests" integer,
    "maxGuests" integer,
    price numeric(10,2),
    currency character varying,
    "priceUnit" character varying,
    languages text,
    "targetAudience" text,
    tags text,
    highlights text,
    included text,
    excluded text,
    "addOns" text,
    notes text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.experience OWNER TO postgres;

--
-- Name: flyer_doc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyer_doc (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "originalName" character varying NOT NULL,
    "mimeType" character varying,
    "extractedData" jsonb,
    "whatsappMessage" text,
    "flyerHtml" text,
    "contentHash" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.flyer_doc OWNER TO postgres;

--
-- Name: group_departure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_departure (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    operator character varying NOT NULL,
    destination character varying NOT NULL,
    title character varying,
    "departureDate" character varying,
    "returnDate" character varying,
    price character varying,
    currency character varying,
    inclusions text,
    capacity character varying,
    deadline character varying,
    guide character varying,
    "whatsappMessage" text,
    "flyerHtml" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "webCategory" character varying,
    "imageUrl" character varying,
    tags text,
    highlights text
);


ALTER TABLE public.group_departure OWNER TO postgres;

--
-- Name: group_quote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_quote (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "quoteNumber" character varying,
    "groupName" character varying,
    "clientName" character varying,
    destination character varying,
    "startDate" character varying,
    "endDate" character varying,
    "validUntil" character varying,
    pax integer DEFAULT 0 NOT NULL,
    currency character varying DEFAULT 'USD'::character varying NOT NULL,
    "globalCommission" integer DEFAULT 20 NOT NULL,
    services jsonb DEFAULT '[]'::jsonb NOT NULL,
    includes text,
    excludes text,
    observations text,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    "totalPerPerson" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "totalSelling" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "totalNet" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "commissionMode" character varying DEFAULT 'percent'::character varying NOT NULL,
    "priceOverride" numeric(14,2),
    payments jsonb DEFAULT '[]'::jsonb NOT NULL,
    "providerPayments" jsonb DEFAULT '[]'::jsonb NOT NULL,
    project character varying,
    "passengerIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "clientNotes" text,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.group_quote OWNER TO postgres;

--
-- Name: hotel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    stars integer DEFAULT 3 NOT NULL,
    description text,
    address character varying,
    "imageUrl" character varying,
    amenities text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "destinationId" uuid,
    "mapsUrl" character varying,
    rating double precision,
    reviews text,
    "isPreferred" boolean DEFAULT false NOT NULL,
    segment character varying
);


ALTER TABLE public.hotel OWNER TO postgres;

--
-- Name: invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tenantId" character varying,
    "bookingFileId" uuid,
    type character varying NOT NULL,
    "puntoVenta" integer,
    "numeroComprobante" integer,
    cae character varying,
    "caeVto" character varying,
    neto21 numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    neto105 numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "noGravado" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    exento numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    percepciones numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "totalAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying DEFAULT 'ARS'::character varying NOT NULL,
    status character varying DEFAULT 'DRAFT'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "quoteId" character varying,
    "serviceId" character varying
);


ALTER TABLE public.invoice OWNER TO postgres;

--
-- Name: manual_quote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.manual_quote (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "passengerId" uuid,
    title character varying,
    destination character varying,
    currency character varying DEFAULT 'USD'::character varying NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    "nextFollowUp" timestamp without time zone,
    "soldAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    reference character varying,
    passengers jsonb DEFAULT '[]'::jsonb NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    notes text,
    "soldPriceCollected" numeric(12,2),
    "totalNetCostSnapshot" numeric(12,2),
    "clientName" character varying,
    "startDate" character varying,
    "endDate" character varying,
    "paxCount" integer DEFAULT 1 NOT NULL,
    "additionalPassengers" jsonb DEFAULT '[]'::jsonb NOT NULL,
    payments jsonb DEFAULT '[]'::jsonb NOT NULL,
    "providerPayments" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "globalAdjustment" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "clientRequestNotes" text,
    invoices jsonb DEFAULT '[]'::jsonb NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.manual_quote OWNER TO postgres;

--
-- Name: operator; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operator (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    "defaultCommissionPercentage" numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    "contactEmail" character varying,
    "contactPhone" character varying,
    "internalNotes" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.operator OWNER TO postgres;

--
-- Name: passenger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passenger (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    surname character varying NOT NULL,
    email character varying,
    whatsapp character varying,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "passportNumber" character varying,
    "birthDate" character varying,
    "passportExpiration" character varying,
    nationality character varying
);


ALTER TABLE public.passenger OWNER TO postgres;

--
-- Name: payment_intent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_intent (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tenantId" character varying,
    amount numeric(12,2) NOT NULL,
    currency character varying DEFAULT 'ARS'::character varying NOT NULL,
    status character varying DEFAULT 'PENDING'::character varying NOT NULL,
    "preferenceId" character varying,
    "mpPaymentId" character varying,
    "transactionId" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_intent OWNER TO postgres;

--
-- Name: quote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "originCity" character varying DEFAULT 'Buenos Aires'::character varying NOT NULL,
    destination character varying NOT NULL,
    "travelersCount" integer NOT NULL,
    "hotelCategory" character varying NOT NULL,
    "directFlights" boolean NOT NULL,
    "tripStyle" character varying NOT NULL,
    "isCentric" boolean NOT NULL,
    budget numeric NOT NULL,
    "activitiesQuote" boolean DEFAULT false NOT NULL,
    "roomDistribution" character varying DEFAULT 'Doble'::character varying NOT NULL,
    "accommodationType" character varying DEFAULT 'Hotel'::character varying NOT NULL,
    "durationDays" integer DEFAULT 7 NOT NULL,
    "travelDates" character varying DEFAULT 'Flexibles'::character varying NOT NULL,
    "mealPlan" character varying DEFAULT 'Desayuno'::character varying NOT NULL,
    "aiResponse" jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quote OWNER TO postgres;

--
-- Name: room_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_type (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    "mealPlan" character varying,
    "capacityAdults" integer DEFAULT 2 NOT NULL,
    "capacityChildren" integer DEFAULT 0 NOT NULL,
    description text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "hotelId" uuid
);


ALTER TABLE public.room_type OWNER TO postgres;

--
-- Name: sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "passengerName" character varying NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying DEFAULT 'USD'::character varying NOT NULL,
    "paymentStatus" character varying DEFAULT 'pending'::character varying NOT NULL,
    "travelDate" timestamp without time zone,
    "internalNotes" text,
    "paymentHistory" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "quoteId" uuid
);


ALTER TABLE public.sale OWNER TO postgres;

--
-- Name: treasury_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treasury_account (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    currency character varying NOT NULL,
    "initialBalance" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.treasury_account OWNER TO postgres;

--
-- Name: treasury_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treasury_transaction (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "accountId" uuid NOT NULL,
    type character varying NOT NULL,
    category character varying NOT NULL,
    amount numeric(14,2) NOT NULL,
    date date NOT NULL,
    reference character varying,
    "relatedEntityId" character varying,
    "relatedEntityType" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "tenantId" character varying,
    "paymentMethod" character varying,
    "bookingFileId" uuid,
    "invoiceId" uuid
);


ALTER TABLE public.treasury_transaction OWNER TO postgres;

--
-- Name: web_package; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.web_package (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    price numeric(10,2),
    currency character varying,
    duration character varying,
    location character varying,
    "isPublished" boolean DEFAULT true NOT NULL,
    "webCategory" character varying NOT NULL,
    "imageUrl" character varying,
    tags text,
    highlights text,
    included text,
    excluded text,
    itinerary text,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "isPromo" boolean DEFAULT false NOT NULL,
    "promoLabel" character varying,
    "originalPrice" numeric(10,2),
    "promoEndsAt" timestamp without time zone,
    "isHeroBanner" boolean DEFAULT false NOT NULL,
    "heroBannerText" character varying,
    subtitle character varying,
    "sourceId" character varying,
    "customSections" text
);


ALTER TABLE public.web_package OWNER TO postgres;

--
-- Name: agency_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_settings ALTER COLUMN id SET DEFAULT nextval('public.agency_settings_id_seq'::regclass);


--
-- Name: destination_asset id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_asset ALTER COLUMN id SET DEFAULT nextval('public.destination_asset_id_seq'::regclass);


--
-- Data for Name: agency_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agency_settings (id, name, phone, slogan, "colorPrimary", "colorAccent", "logoFullUrl", "logoCompactUrl", "createdAt", "updatedAt") FROM stdin;
1	Concepto Evt	5491137766748	Viaja con concepto	#1e3a5f	#f97316	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777251414/travel_agency/destinations/iugt8jq4l0lfr19gdeqr.png	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777251425/travel_agency/destinations/qofuiomevvab3fav7cos.png	2026-04-26 20:23:49.802122	2026-05-02 18:10:30.545482
\.


--
-- Data for Name: booking_file; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_file (id, "tenantId", "clientId", destination, "travelDates", "totalPrice", currency, status, "createdAt", "updatedAt") FROM stdin;
5f0c3df7-c13b-400c-b67f-8bbdf10d0539	\N	\N	Porto Seguro o Maragogi	28 de Junio al 08 de Julio	22222.00	USD	OPEN	2026-06-20 14:59:20.76262	2026-06-20 14:59:20.76262
a35f12f0-aaa1-4ae9-b652-0ae98ceb9e51	\N	347fa474-eb2c-43fc-a7f2-588497ed1a13	Europa	2026-07-20 al 2026-08-05	4030.42	USD	OPEN	2026-06-30 17:57:19.159464	2026-06-30 17:57:19.159464
1f72c628-3197-40b4-869c-5788b96a7b47	\N	13548ef5-0a3e-4322-9260-9e4d95b52490	Naples	2026-07-07 al 2026-07-17	4860.26	USD	OPEN	2026-07-08 20:27:34.165101	2026-07-08 20:27:34.165101
a453dcd8-6ca4-419b-8639-df703a7d68ad	\N	cfcf7737-3360-47d7-b9bf-3e675a704037	Europa	2026-09-01 al 2026-09-10	921.12	USD	OPEN	2026-07-15 11:50:37.720337	2026-07-15 11:50:37.720337
298d7555-b462-4c37-8b4a-4c3d630696fe	\N	b8739b65-d1ca-44a4-a30e-6369b00cd6f8	Europa	2026-10-08 al 2026-10-26	2969.32	USD	OPEN	2026-07-17 15:54:49.271703	2026-07-17 15:54:49.271703
\.


--
-- Data for Name: circuit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.circuit (id, codigo_circuito, nombre, duracion, paises_visitados, ciudades_itinerario, meses_operacion, precio_base_eur, itinerario_resumido, hoteles_previstos, operator, destination, title, duration, price, currency, dates, inclusions, exclusions, "rawText", categoria, "sourceFile", "createdAt", "updatedAt", "isPublished", "webCategory", "imageUrl", tags, highlights, "whatsappMessage", "flyerData") FROM stdin;
\.


--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (id, name, email, phone, notes, "createdAt", "updatedAt") FROM stdin;
a029dd7e-e205-48e8-82de-5214893af7ed	Academia	\N	\N	\N	2026-06-18 21:34:42.322177	2026-06-18 21:34:42.322177
bbea3b85-1d5c-40c8-9b88-b3b8b7a237f8	Academia MM	\N	\N	\N	2026-06-18 21:34:47.739985	2026-06-18 21:34:47.739985
347fa474-eb2c-43fc-a7f2-588497ed1a13	Abadie, Luciana	\N	\N	\N	2026-06-30 17:57:18.998224	2026-06-30 17:57:18.998224
13548ef5-0a3e-4322-9260-9e4d95b52490	Martino, Ana María	\N	\N	\N	2026-07-08 20:27:34.076599	2026-07-08 20:27:34.076599
cfcf7737-3360-47d7-b9bf-3e675a704037	CASTRO, ALFREDO LUIS	\N	\N	\N	2026-07-15 11:50:37.7151	2026-07-15 11:50:37.7151
b8739b65-d1ca-44a4-a30e-6369b00cd6f8	Horacio Mayorga	\N	\N	\N	2026-07-17 15:54:49.263566	2026-07-17 15:54:49.263566
\.


--
-- Data for Name: destination; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination (id, name, country, description, "iataCode", "imageUrl", "createdAt", "updatedAt") FROM stdin;
bb8ac9a0-63b3-4b1c-be6c-ee573f5a89dd	Madrid	\N	\N	\N	\N	2026-06-21 21:55:54.710585	2026-06-21 21:55:54.710585
e13a858d-e1b2-4594-ae04-d5cc264470f0	São Paulo, Brasil	\N	\N	\N	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1783607217/travel_agency/destinations/p5ci7xyuwprhnkfricgy.jpg	2026-07-09 11:26:57.327795	2026-07-09 11:26:57.327795
\.


--
-- Data for Name: destination_asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_asset (id, destination, "imageUrl", "publicId", "hotelName", "isDefault", "createdAt", "updatedAt") FROM stdin;
1	san pablo, brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777661143/travel_agency/destinations/pbksepntesbytamfrmvh.jpg	travel_agency/destinations/pbksepntesbytamfrmvh	\N	t	2026-05-01 15:45:44.045269	2026-05-01 15:45:44.045269
2	san pablo, brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777661209/travel_agency/destinations/jks4ne852l0t4mnnjebs.jpg	travel_agency/destinations/jks4ne852l0t4mnnjebs	B&B São Paulo Luz Centro	t	2026-05-01 15:46:49.773542	2026-05-01 15:46:49.773542
3	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777665849/travel_agency/destinations/mgb6yiiqnzt492g5ykzb.png	travel_agency/destinations/mgb6yiiqnzt492g5ykzb	\N	t	2026-05-01 17:04:09.899169	2026-05-01 17:04:09.899169
4	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777670945/travel_agency/destinations/rl8yoslyxnhr128vv4oj.jpg	travel_agency/destinations/rl8yoslyxnhr128vv4oj	Vila Galé Eco Resort Cabo de Santo Agostinho	t	2026-05-01 18:29:05.997886	2026-05-01 18:29:05.997886
5	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777849668/travel_agency/destinations/c34l8j7skzfsvwsfipp3.jpg	travel_agency/destinations/c34l8j7skzfsvwsfipp3	Divi Divi Praia	t	2026-05-03 20:07:49.695111	2026-05-03 20:07:49.695111
6	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777849738/travel_agency/destinations/rdnlxwhduo0glxzw4ca4.avif	travel_agency/destinations/rdnlxwhduo0glxzw4ca4	Ello Pousada	t	2026-05-03 20:09:01.041954	2026-05-03 20:09:01.041954
7	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1777849796/travel_agency/destinations/xhlnjmy2uth3buigfbjp.webp	travel_agency/destinations/xhlnjmy2uth3buigfbjp	Vila Galé Touros	t	2026-05-03 20:09:58.170588	2026-05-03 20:09:58.170588
8	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778026899/travel_agency/destinations/b6r2bpyjgmxtdkoejtvn.jpg	travel_agency/destinations/b6r2bpyjgmxtdkoejtvn	\N	t	2026-05-05 21:21:40.524107	2026-05-05 21:21:40.524107
9	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778026941/travel_agency/destinations/ocs8dzdeaz0eo4wwo2xu.jpg	travel_agency/destinations/ocs8dzdeaz0eo4wwo2xu	Divi Divi Praia	t	2026-05-05 21:22:23.081113	2026-05-05 21:22:23.081113
10	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778026956/travel_agency/destinations/u5haj7cyogfy3opymgp6.webp	travel_agency/destinations/u5haj7cyogfy3opymgp6	Vila Galé Touros	t	2026-05-05 21:22:38.071502	2026-05-05 21:22:38.071502
11	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778026964/travel_agency/destinations/rmnwe7fkuoedivemoiaw.avif	travel_agency/destinations/rmnwe7fkuoedivemoiaw	Ello Pousada	t	2026-05-05 21:22:45.956686	2026-05-05 21:22:45.956686
12	jamaica	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778075598/travel_agency/destinations/xy8lsphkemt5riokc3sl.jpg	travel_agency/destinations/xy8lsphkemt5riokc3sl	\N	t	2026-05-06 10:53:19.039337	2026-05-06 10:53:19.039337
13	jamaica	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778451651/travel_agency/destinations/uvrpkxmovi9xpjqvlsoi.jpg	travel_agency/destinations/uvrpkxmovi9xpjqvlsoi	\N	t	2026-05-10 19:20:51.259358	2026-05-10 19:20:51.259358
14	jamaica	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778454447/travel_agency/destinations/ywfp8mam1gdpp9pyke0p.jpg	travel_agency/destinations/ywfp8mam1gdpp9pyke0p	\N	t	2026-05-10 20:07:27.88716	2026-05-10 20:07:27.88716
15	jamaica	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778455215/travel_agency/destinations/ltpzudolw7wujsbsj1xp.jpg	travel_agency/destinations/ltpzudolw7wujsbsj1xp	\N	t	2026-05-10 20:20:15.316154	2026-05-10 20:20:15.316154
16	jamaica	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778464077/travel_agency/destinations/ip7ozyfaypbcnz9qv4el.jpg	travel_agency/destinations/ip7ozyfaypbcnz9qv4el	\N	t	2026-05-10 22:47:57.817092	2026-05-10 22:47:57.817092
17	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778637208/travel_agency/destinations/zo4aea07psq9yx9w7d8a.jpg	travel_agency/destinations/zo4aea07psq9yx9w7d8a	\N	t	2026-05-12 22:53:29.134978	2026-05-12 22:53:29.134978
18	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778640189/travel_agency/destinations/yo7hlau7suxk4opl1uac.jpg	travel_agency/destinations/yo7hlau7suxk4opl1uac	\N	t	2026-05-12 23:43:10.339634	2026-05-12 23:43:10.339634
19	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778640346/travel_agency/destinations/vbjrbghuthepfrwhbcui.jpg	travel_agency/destinations/vbjrbghuthepfrwhbcui	\N	t	2026-05-12 23:45:47.649197	2026-05-12 23:45:47.649197
20	caribe	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778640999/travel_agency/destinations/h0gvsyqellsssmiejm61.avif	travel_agency/destinations/h0gvsyqellsssmiejm61	\N	t	2026-05-12 23:56:40.196733	2026-05-12 23:56:40.196733
21	italia	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778641404/travel_agency/destinations/blecxwg4skdwsmlkuqox.webp	travel_agency/destinations/blecxwg4skdwsmlkuqox	\N	t	2026-05-13 00:03:25.799252	2026-05-13 00:03:25.799252
22	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778706109/travel_agency/destinations/sbq04tqjsvvya3g1g745.jpg	travel_agency/destinations/sbq04tqjsvvya3g1g745	\N	t	2026-05-13 18:01:50.874702	2026-05-13 18:01:50.874702
23	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781830663/travel_agency/destinations/pxnmzn6sozf4koxzdnjl.jpg	travel_agency/destinations/pxnmzn6sozf4koxzdnjl	\N	t	2026-06-18 21:57:43.948185	2026-06-18 21:57:43.948185
24	costa mujeres	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781832834/travel_agency/destinations/mwpid4kztfdirmnngjpq.webp	travel_agency/destinations/mwpid4kztfdirmnngjpq	\N	t	2026-06-18 22:33:55.036972	2026-06-18 22:33:55.036972
25	são paulo, brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781837163/travel_agency/destinations/vcg3vjh2fm2cwe52zt5r.jpg	travel_agency/destinations/vcg3vjh2fm2cwe52zt5r	\N	t	2026-06-18 23:46:03.642994	2026-06-18 23:46:03.642994
26	são paulo, brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781837253/travel_agency/destinations/v0jbvhm2qoxtntzw3p4a.png	travel_agency/destinations/v0jbvhm2qoxtntzw3p4a	Pan Americano	t	2026-06-18 23:47:34.143585	2026-06-18 23:47:34.143585
27	são paulo, brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781838037/travel_agency/destinations/e9b7m6gq2di1rvpqwyzo.png	travel_agency/destinations/e9b7m6gq2di1rvpqwyzo	Pan Americano	t	2026-06-19 00:00:38.270823	2026-06-19 00:00:38.270823
28	são paulo, brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781838050/travel_agency/destinations/nsvfhnrwrf5sbgcgfzsn.jpg	travel_agency/destinations/nsvfhnrwrf5sbgcgfzsn	\N	t	2026-06-19 00:00:51.114888	2026-06-19 00:00:51.114888
29	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781968851/travel_agency/destinations/qpfi9iomne6kzq3kaszy.webp	travel_agency/destinations/qpfi9iomne6kzq3kaszy	Principe do Muta Hotel Design	t	2026-06-20 12:20:51.759607	2026-06-20 12:20:51.759607
30	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781968885/travel_agency/destinations/yslozygwvls1exua1tmt.webp	travel_agency/destinations/yslozygwvls1exua1tmt	Mediterranee Hotel by Castelo Itaipava	t	2026-06-20 12:21:26.385154	2026-06-20 12:21:26.385154
31	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781968931/travel_agency/destinations/ifgl7c15s0zbzdjmapal.webp	travel_agency/destinations/ifgl7c15s0zbzdjmapal	Ibis Barra de Tijuca	t	2026-06-20 12:22:11.786369	2026-06-20 12:22:11.786369
32	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781969035/travel_agency/destinations/vfbuoe2tkcduuhvhaefv.jpg	travel_agency/destinations/vfbuoe2tkcduuhvhaefv	\N	t	2026-06-20 12:23:55.878686	2026-06-20 12:23:55.878686
33	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781969870/travel_agency/destinations/iubhitr5hb1oiuoriii7.jpg	travel_agency/destinations/iubhitr5hb1oiuoriii7	\N	t	2026-06-20 12:37:51.047684	2026-06-20 12:37:51.047684
34	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781969873/travel_agency/destinations/i0swjfje1urecdhxxuux.webp	travel_agency/destinations/i0swjfje1urecdhxxuux	Principe do Muta Hotel Design	t	2026-06-20 12:37:54.157328	2026-06-20 12:37:54.157328
35	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781969876/travel_agency/destinations/ftam8kpjs4jyv6c7pyt9.webp	travel_agency/destinations/ftam8kpjs4jyv6c7pyt9	Mediterranee Hotel by Castelo Itaipava	t	2026-06-20 12:37:56.774163	2026-06-20 12:37:56.774163
36	brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1781969878/travel_agency/destinations/vrbsrkulp5chcxgyecgl.webp	travel_agency/destinations/vrbsrkulp5chcxgyecgl	Ibis Barra de Tijuca	t	2026-06-20 12:37:59.590869	2026-06-20 12:37:59.590869
37	são paulo, brasil	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1783607217/travel_agency/destinations/p5ci7xyuwprhnkfricgy.jpg	travel_agency/destinations/p5ci7xyuwprhnkfricgy	\N	t	2026-07-09 11:26:57.307925	2026-07-09 11:26:57.307925
\.


--
-- Data for Name: experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.experience (id, title, subtitle, slug, category, "hostName", "hostTitle", "hostBio", description, "shortDescription", "imageUrl", "videoUrl", gallery, location, duration, "availableDates", "availabilityMode", "minGuests", "maxGuests", price, currency, "priceUnit", languages, "targetAudience", tags, highlights, included, excluded, "addOns", notes, "isPublished", "isFeatured", "createdAt", "updatedAt") FROM stdin;
8f13be08-6c64-43a4-8791-26b9eadbcfdf	Cena íntima con Fernando Signorini (3hs)	Football, stories and Argentine culture in an intimate private evening	dinner-with-fernando-signorini	SPORTS	Fernando Signorini	Preparador fisico y referente del futbol argentino	Encuentro a validar con autorizacion comercial, disponibilidad y condiciones de uso de nombre e imagen antes de publicar.	Cena intima con fer	Cena Intima con el profe fer	https://res.cloudinary.com/dm1mwhpsz/image/upload/v1778034919/travel_agency/destinations/em3s6p8gtb4gffrkva8w.jpg			Buenos Aires	3 horas	A demanda	ON_REQUEST	10	30	115.00	USD	por persona	Spanish,Portuguese	International travelers,Private groups,Corporate incentive groups,Football fans	Sports Experience,Argentina Football,Private Dinner				[]		t	t	2026-05-05 23:29:57.477307	2026-05-05 23:39:55.114591
\.


--
-- Data for Name: flyer_doc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyer_doc (id, "originalName", "mimeType", "extractedData", "whatsappMessage", "flyerHtml", "contentHash", "createdAt") FROM stdin;
\.


--
-- Data for Name: group_departure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_departure (id, operator, destination, title, "departureDate", "returnDate", price, currency, inclusions, capacity, deadline, guide, "whatsappMessage", "flyerHtml", "createdAt", "isPublished", "webCategory", "imageUrl", tags, highlights) FROM stdin;
\.


--
-- Data for Name: group_quote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_quote (id, "quoteNumber", "groupName", "clientName", destination, "startDate", "endDate", "validUntil", pax, currency, "globalCommission", services, includes, excludes, observations, status, "totalPerPerson", "totalSelling", "totalNet", "createdAt", "updatedAt", "commissionMode", "priceOverride", payments, "providerPayments", project, "passengerIds", "clientNotes", "deletedAt") FROM stdin;
6a0c2a46-4ffb-4d62-ab4e-b3579c3fc31c	COT-G-20260613-9667	Academia - Grupo del Jueves 18 de Junio	Academia MM	Buenos Aires	2026-06-18			76	ARS	20	[{"id": "5viof58d0", "type": "excursion", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 1, "liberados": 9, "categories": [], "commission": 0, "providerId": "3e9de198-78b7-4b6b-a85e-d325dc31342c", "billingMode": "per_person", "description": "Museo de River", "netUnitCost": 29000, "commissionMode": "percent"}, {"id": "uffklie7z", "type": "other", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 64, "liberados": 9, "categories": [], "commission": 0, "providerId": "e3e3cf31-528c-44f3-8fce-7c8ebe773b12", "billingMode": "per_person", "description": "Comida", "netUnitCost": 25500, "commissionMode": "percent"}, {"id": "sva6zwqxs", "type": "other", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 1, "liberados": 9, "categories": [], "commission": 0, "billingMode": "per_group", "description": "Arbitro", "netUnitCost": 315000, "commissionMode": "percent"}]	• Traslados aeropuerto / hotel (ida y vuelta)\n• Alojamiento según habitaciones indicadas\n• Guía de turismo local	• Vuelos / aéreos internacionales\n• Tasas de embarque\n• Gastos personales\n• Propinas		confirmed	65000.00	4355000.00	3966500.00	2026-06-13 18:41:39.810102	2026-06-18 21:35:12.685825	percent	65000.00	[]	[{"id": "ixfzr6nb2", "date": "2026-06-17", "amount": 854250, "method": "other", "reference": "163728874455", "providerId": "e3e3cf31-528c-44f3-8fce-7c8ebe773b12"}, {"id": "oaflzv57y", "date": "2026-06-18", "amount": 1943000, "method": "other", "reference": "", "providerId": "3e9de198-78b7-4b6b-a85e-d325dc31342c"}, {"id": "4op1n8wei", "date": "2026-06-18", "amount": 315000, "method": "other", "reference": "", "providerId": "e3e3cf31-528c-44f3-8fce-7c8ebe773b12"}]	\N	[]	\N	\N
33fce4ec-e01f-456b-b227-aa0c7bb03cb5	COT-G-20260613-1472	Academia - Grupo del 20 de Junio	Academia MM	Buenos Aires	2026-06-20			135	ARS	20	[{"id": "3xhhnonub", "type": "excursion", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 1, "liberados": 0, "categories": [{"id": "7seprrhz8", "label": "Jugadores", "value": 24000, "quantity": 73, "priceMode": "fixed"}, {"id": "itaqsk829", "label": "Adultos Padres", "value": 30000, "quantity": 53, "priceMode": "fixed"}, {"id": "awfos1o07", "label": "Liberados", "value": 0, "quantity": 9, "priceMode": "fixed"}], "commission": 0, "providerId": "3e9de198-78b7-4b6b-a85e-d325dc31342c", "billingMode": "per_person", "description": "Museo de River", "netUnitCost": 0, "commissionMode": "percent"}, {"id": "qh7mqug35", "type": "excursion", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 1, "liberados": 9, "categories": [], "commission": 0, "providerId": "e3e3cf31-528c-44f3-8fce-7c8ebe773b12", "billingMode": "per_person", "description": "Comida", "netUnitCost": 25500, "commissionMode": "percent"}, {"id": "0jpjyceqq", "type": "other", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 1, "liberados": 9, "categories": [], "commission": 0, "billingMode": "per_group", "description": "Arbitro", "netUnitCost": 365000, "commissionMode": "percent"}]	• Traslados aeropuerto / hotel (ida y vuelta)\n• Alojamiento según habitaciones indicadas\n• Guía de turismo local	• Vuelos / aéreos internacionales\n• Tasas de embarque\n• Gastos personales\n• Propinas		confirmed	65000.00	8190000.00	6920000.00	2026-06-13 19:48:26.573675	2026-06-23 22:39:33.923749	percent	65000.00	[{"id": "npa2k7f44", "date": "2026-06-23", "amount": 8190000, "method": "transfer", "reference": ""}]	[{"id": "84j9m2dol", "date": "2026-06-17", "amount": 1670250, "method": "other", "reference": "163728874455", "providerId": "e3e3cf31-528c-44f3-8fce-7c8ebe773b12"}]	\N	[]	\N	\N
ed7b5f09-ff7a-4a8c-a310-2c115f319916	COT-G-20260613-3726	Academia - Grupo del 23 de Junio	Academia MM		2026-06-23			64	ARS	20	[{"id": "rn20f8hb9", "type": "excursion", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 1, "liberados": 0, "categories": [{"id": "1c9vny9s8", "label": "Jugadores", "value": 24000, "quantity": 36, "priceMode": "fixed"}, {"id": "fa9ywjpe4", "label": "Padres", "value": 30000, "quantity": 20, "priceMode": "fixed"}], "commission": 0, "providerId": "3e9de198-78b7-4b6b-a85e-d325dc31342c", "billingMode": "per_person", "description": "Museo de River", "netUnitCost": 0, "commissionMode": "percent"}, {"id": "kb85t0tqd", "type": "other", "notes": "", "nights": 1, "currency": "ARS", "optional": false, "quantity": 1, "liberados": 8, "categories": [], "commission": 0, "providerId": "e3e3cf31-528c-44f3-8fce-7c8ebe773b12", "billingMode": "per_person", "description": "Comidas", "netUnitCost": 21500, "commissionMode": "percent"}]	• Traslados aeropuerto / hotel (ida y vuelta)\n• Alojamiento según habitaciones indicadas\n• Guía de turismo local	• Vuelos / aéreos internacionales\n• Tasas de embarque\n• Gastos personales\n• Propinas		confirmed	65000.00	3640000.00	2668000.00	2026-06-13 19:53:11.486612	2026-07-21 18:59:20.31296	percent	65000.00	[{"id": "bbx3ks7ig", "date": "2026-06-23", "amount": 3640000, "method": "transfer", "reference": ""}]	[{"id": "uad3k8qu2", "date": "2026-06-23", "amount": 1464000, "method": "other", "reference": "", "providerId": "3e9de198-78b7-4b6b-a85e-d325dc31342c"}, {"id": "xyq09mux6", "date": "2026-06-23", "amount": 1204000, "method": "other", "reference": "", "providerId": "e3e3cf31-528c-44f3-8fce-7c8ebe773b12"}]		[]	\N	\N
\.


--
-- Data for Name: hotel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotel (id, name, stars, description, address, "imageUrl", amenities, "createdAt", "updatedAt", "destinationId", "mapsUrl", rating, reviews, "isPreferred", segment) FROM stdin;
5591dff4-1e63-4dfa-a834-8686830bb0b7	B&B HOTEL Madrid Centro Puerta del Sol	5		C. de la Montera, 10, Centro, 28013 Madrid, España	https://places.googleapis.com/v1/places/ChIJ5-rOroAoQg0Rn285CcmTETI/photos/AaVGc3kN_DGL7mv5qmvt7auoJxQNuQ963o-nxpfn47fvWgPYfOqw9_kgMw8snXpM4eL9TrRFsMPhbwFy_w7CDGlvqfDTLpUNmAJTnbxI5yKb7XChfKnpGbnD-WlnfuAAg9INqfzZPhQNHMYLV2bJi_eBNlZW3uU-gHxFwQKCE3q3EQtFgYVj-zBtrIxFcZHQ10OVUjnm6WoUdIAL0ne9HSCsZ6pIMXCr13XZ4ZvKxzq_Ayk5RdzBINaLDqNZYzQJ-HYiH9IeOE4WacXswLSx3uY27ictRTfer4MHKZuryuTbQIeIBBHcf-POI_HyaVPPlLShqno-mcAF8KnzDXZk0Qz5Mo2jq5DCJ0ymWyFiiyzmw014XNUvY_UHEKdW9M6qp1Q5diw0aCUqZJJy3CxSPJDyfjUgzO9TMUDgw1Z-jITafw-Ij7yF/media?maxHeightPx=400&key=AIzaSyDt3egCrJOFoUAaEvsPzlTBLK-h91kS760	\N	2026-06-21 21:55:54.888356	2026-06-21 21:55:54.888356	bb8ac9a0-63b3-4b1c-be6c-ee573f5a89dd	https://maps.google.com/?cid=3607827268152946591&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA	4.6	[{"authorName":"Àngela C.P","rating":4,"text":"Hace años que repetimos en este hotel cuando viajamos a madrid, han subido los precios, no es que antes fuera barato pero esta última vez nos ha parecido excesivo porque es un 3*. La ubicación es genial el trato también no tenemos queja ninguna. Y es un hotel muy tranquilo. Nos encanta la bolsita en la puerta al despertar con un detalle para desayunar. Y su zona de café, te y galletas abierto 24h es fantástico.","relativePublishTimeDescription":"Hace 6 meses","publishTime":"2025-12-07T21:12:44.926034611Z"},{"authorName":"Catheryn D","rating":2,"text":"La ubicación del hotel es excelente, pero me da mucha pena que tanto la limpieza, la calidad de las cosas, la atención de las chicas de recepción y en general ha bajado mucho el nivel. Nos vinimos bastante desconformes. Dejamos además para que nos limpiaran la habitación, estuvimos como 2 horas fuera y cuando llegamos la habitación estaba igual que como la habíamos dejado. La limpiadora como nos escuchó que estábamos enfadados, nos cambió las toallas muy rápido y nos tiró la basura y estiró las sábanas, pero nada más. Muy desconforme con todo.","relativePublishTimeDescription":"Hace 5 meses","publishTime":"2026-01-06T17:07:26.610134408Z"},{"authorName":"Jamie Blanco","rating":5,"text":"Mi estadía en el hotel fue realmente muy agradable. Desde el momento de mi llegada, el personal fue atento, amable y siempre dispuesto a ayudar. Las instalaciones son cómodas, limpias y bien cuidadas, lo que hizo que me sintiera tranquila y a gusto durante toda mi estancia.\\n\\nLa habitación era amplia, organizada y muy confortable, con una cama cómoda que permitió un buen descanso. Además, el hotel cuenta con espacios acogedores y un ambiente tranquilo, ideal tanto para relajarse como para trabajar.\\n\\nUno de los aspectos que más destaco es su excelente ubicación, ya que se encuentra cerca de puntos importantes, restaurantes y zonas de interés, lo que facilita mucho la movilidad y permite aprovechar mejor el tiempo.\\n\\nSin duda, es un lugar que recomendaría y al que volvería en una próxima oportunidad.","relativePublishTimeDescription":"Hace 4 meses","publishTime":"2026-02-21T07:46:38.376293852Z"},{"authorName":"Javier Sanchis","rating":5,"text":"Hotel ideal para disfrutar de Madrid. No incluye desayuno pero disponen de una sala con fruta, cafeteras y dulces disponibles durante todo el día donde puedes hacerlo, o simplemente bajar y tomarte un cafe. Además tiene el detalle de dejarte bollería y agua todas las mañanas en la puerta de la habitación.\\nLas habitaciones están limpisimas y aunque el precio para ser un 3* es alto, creo que es la tendencia en la ciudad y este año menos por ubicación está justificado.\\nSin duda si vuelvo a Madrid, volveré a alojarme en este hotel.\\n\\nEn la terraza disponen de restaurante gestionado por una empresa externa y sirven buenos cócteles.","relativePublishTimeDescription":"Hace 7 meses","publishTime":"2025-10-28T13:55:03.137704024Z"},{"authorName":"Jesus Heras","rating":5,"text":"La habitación estaba en excelentes condiciones, cómoda y bien cuidada. El baño también muy bien, limpio y funcional, y la regadera excelente, con muy buena presión y temperatura perfecta.\\n\\nLa ubicación es inmejorable, justo en el centro y con el metro a pasos de distancia. Sin duda es una muy buena opción para hospedarse en Madrid.","relativePublishTimeDescription":"Hace 3 meses","publishTime":"2026-03-03T19:29:31.903050997Z"}]	f	\N
db2e54b3-4e84-4796-a0ac-2b3ba5badeb8	Dear Hotel Madrid	5		Gran Vía, 80, Centro, 28013 Madrid, España	https://places.googleapis.com/v1/places/ChIJx6DI12QoQg0RyQLwL6TfU4M/photos/AaVGc3kua0KhK0qiRJTWIMuiI85_IU42gNkUTK5kEI6ETsFPMn4yD9KC4S_DRF71WJarVMO6mVNpN56PxrHtbgcuT7pAY8Lf13nEnmgix8A0DzAT5ZT0GuNrOsu5JJaxRrg9u_e5EOF7N6PQ5W9R1MhTXghcbsMuNo__hp15gLyFuO9MWIpyvEkuly8b8nYpH8B5hMa4x9cZ68-1MDg-3qqhD_zjYohGFHO1xCSVRhUBXudDGGn8lxrF7h7H5vMEY7MonzGXOSvn9iRuaExKfC8REDlITZXZoMx3i4xabuc_0wBoSTAMvsR2tKUTGXF5Tp0-eEPGUFs5cD3B6wK56WqZiGv5PR9VAdRYv3eenjYT09n_04ebxayhezr1asE1t59iS2GLUNwdjRWkUFUEpHytdUdJDQ8p1Snwb9yQQh7OATfor6Po4H8RgMdt9rnnbw/media?maxHeightPx=400&key=AIzaSyDt3egCrJOFoUAaEvsPzlTBLK-h91kS760	\N	2026-06-23 22:38:27.568782	2026-06-23 22:38:27.568782	bb8ac9a0-63b3-4b1c-be6c-ee573f5a89dd	https://maps.google.com/?cid=9463153138307433161&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA	4.6	[{"authorName":"jose ibañez","rating":5,"text":"Un hotel maravilloso. Llevo viniendo desde que se abrió. La terraza es espectacular y la llegada del calor la hace especialmente atractiva para desayunar o tomar algo con la familia o con los amigos.\\nFelicidades a Jorge, el responsable de los desayunos, una persona súper profesional y agradable que maneja la avalanchas de las mañana y nuestras prisas como nadie 😊.\\nRecomendable 100% para unos en Madrid","relativePublishTimeDescription":"Hace 3 semanas","publishTime":"2026-05-28T07:36:37.501287461Z"},{"authorName":"amparo alvaro","rating":1,"text":"Para ser un hotel de 4 estrellas deja mucho que desear.\\nEl servicio de limpieza en la habitación, era pésimo, pues 2 días desde las 10 de la mañana hasta las 15 h del mediodía nos encontramos la habitación sin hacer.\\nBajamos a recepción, para comentarlo y la respuesta no fue muy idonea , nos respondieron así , tienen prioridad las habitaciones que van a ser ocupadas , no es muy normal cuando yo pago igual , la nevera no tenía nada para beber estaba vacía ningún detalle de bienvenida , el baño en la ducha el mármol estaba roto y la TV no funcionaba , también llamamos y lo solucionaron apagando el automático y al día siguiente teníamos el mismo problema .\\nYo no recomendaría este hotel ni lo valoro como 4 estrellas.","relativePublishTimeDescription":"Hace 3 meses","publishTime":"2026-02-24T18:23:47.624066544Z"},{"authorName":"Yami Martinez","rating":5,"text":"Me alojé en el Hotel Dear Hotel en Plaza España, Madrid, y fue una experiencia muy agradable.\\n\\nEs un hotel sencillo, sin lujos excesivos, pero tiene absolutamente todo lo necesario para una estancia cómoda: habitaciones limpias, buena ubicación y un ambiente tranquilo. Ideal si buscas practicidad y estar bien situado en el centro de Madrid.\\n\\nLo que realmente marcó la diferencia fue el trato de del personal. Los recepcionistas muy agradables, a mi salida Celia fue especialmente amable y atenta en todo momento. Y el señor de las maletas, Omar, tuvo un gesto muy dedicado al ayudarme con el equipaje y acompañarme hasta la calle para conseguirme un taxi. Ese nivel de atención y cuidado no siempre se encuentra, y se agradece mucho.\\n\\nEn general, es una opción muy correcta en Plaza España si buscas comodidad, buena ubicación y un equipo humano que realmente se preocupa por el huésped.\\n\\nVolvería sin duda.","relativePublishTimeDescription":"Hace 3 meses","publishTime":"2026-03-01T05:27:48.171499533Z"},{"authorName":"Victoria Izaguirre","rating":4,"text":"Nos hospedamos por 4 noches en este hotel. Recomiendo por su ubicación y servicio. En un momento necesitamos ayuda para sacar unos tickets para salir de la ciudad en tren, en recepción no estuvieron muy a fin de ayudarnos, no tuvieron mucha disposición (atención al cliente básico).\\nLa atención de JORGE en el desayuno espectacular, es muy amable, simpático y cordial. April también fue muy amable y servicial. Gracias !","relativePublishTimeDescription":"Hace 4 meses","publishTime":"2026-01-28T07:52:41.601820544Z"},{"authorName":"Helen Nuñez","rating":5,"text":"Tuve una excelente experiencia en el Dear Hotel. Desde el primer momento, el servicio fue impecable: el personal siempre amable, atento y dispuesto a ayudar en todo lo necesario.\\n\\nQuiero destacar especialmente a Bea en recepción, quien hizo que nuestra estancia fuera aún más agradable. Fue muy servicial, cercana y profesional, siempre dispuesta a brindar un buen servicio.\\n\\nLa habitación era cómoda, limpia y bien cuidada, con una decoración moderna y acogedora que invita a descansar. Todo estaba en perfectas condiciones y se notaba el cuidado en cada detalle.\\n\\nEn cuanto a la ubicación, es simplemente ideal. Está en una zona céntrica que permite moverse fácilmente por Madrid, cerca de muchos puntos de interés, tiendas y restaurantes.\\n\\nSin duda, es un hotel al que volvería y que recomiendo por su excelente servicio, comodidad y ubicación privilegiada.","relativePublishTimeDescription":"Hace 2 meses","publishTime":"2026-04-21T07:25:06.517643623Z"}]	f	\N
12bad6c9-fe7e-44dc-a07b-509d38dd0b7a	Pan American	3	\N	\N		\N	2026-07-09 11:27:06.692339	2026-07-09 11:27:06.692339	e13a858d-e1b2-4594-ae04-d5cc264470f0	\N	\N	\N	f	\N
\.


--
-- Data for Name: invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice (id, "tenantId", "bookingFileId", type, "puntoVenta", "numeroComprobante", cae, "caeVto", neto21, neto105, "noGravado", exento, percepciones, "totalAmount", currency, status, "createdAt", "updatedAt", "quoteId", "serviceId") FROM stdin;
\.


--
-- Data for Name: manual_quote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.manual_quote (id, "passengerId", title, destination, currency, status, "nextFollowUp", "soldAt", "createdAt", "updatedAt", reference, passengers, items, notes, "soldPriceCollected", "totalNetCostSnapshot", "clientName", "startDate", "endDate", "paxCount", "additionalPassengers", payments, "providerPayments", "globalAdjustment", "clientRequestNotes", invoices, "deletedAt") FROM stdin;
b913f6ca-181c-4e26-863c-5972c8b7e7f5	e696a90a-b39f-481d-a9d6-ce14cc2ccb72	Viaje Buitre		USD	draft	\N	\N	2026-08-21 10:35:55.319748	2026-08-21 13:07:25.722087	\N	[]	[]		\N	\N	Salva, Buitre	2026-10-03	2026-10-10	6	[]	[]	[]	0.00	Viaje Buitre	[]	\N
84512984-7da9-405c-9822-9f78c8818739	d199655a-80b3-4fe4-9184-76b0e0c7ae6e	Martino, Ana María	Naples	USD	confirmed	\N	\N	2026-06-20 23:38:55.974527	2026-07-21 18:47:30.443027	\N	[]	[{"id": "item-gen-84512984-7da9-405c-9822-9f78c8818739-1", "type": "flight", "price": 1000, "details": {"type": "ROUND_TRIP", "airline": "Air Europa", "segments": [{"id": "s-gen-1", "to": "MAD", "from": "EZE", "arrivalDate": "06/09/2026", "arrivalTime": "06:00", "departureDate": "05/09/2026", "departureTime": "13:00"}], "bookingCode": "UX-9912"}, "economics": {"adjustments": [], "baseNetCost": 850, "pricingModel": "total", "commissionType": "fixed", "passengerCount": 1, "commissionValue": 150}}, {"id": "item-gen-84512984-7da9-405c-9822-9f78c8818739-2", "type": "assistance", "price": 130, "details": {"description": "Asistencia al Viajero Cobertura USD 150.000", "confirmationNumber": "UA-998123"}, "economics": {"adjustments": [], "baseNetCost": 100, "pricingModel": "total", "commissionType": "fixed", "passengerCount": 1, "commissionValue": 30}}]	\N	4860.26	3800.00	\N	\N	\N	1	[]	[]	[]	0.00	\N	[]	\N
0c6d83a8-057a-4258-bf8f-3f3ea239584b	56dd8bb6-44f0-4056-82cd-d43a537b0c2b	Viaje Cristina Europa		USD	draft	\N	\N	2026-08-21 10:35:20.514566	2026-09-15 09:48:23.711067	\N	[]	[{"id": "ktg3rso5r", "type": "hotel", "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 1}], "checkIn": "2026-10-04", "checkOut": "2026-10-11", "hotelName": "Hotel MS Maestranza, Avenida Cánovas del Castillo 1, Málaga (29016), Málaga, Spain", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3154783"}, "economics": {"iva": 0, "comision": 197.57, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 1885.76}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "y7wj36362", "type": "service", "price": 224.13, "title": "Excursión a Córdoba con visita a la Mezquita", "details": {"date": "2026-10-06", "time": "08:10", "origin": "Málaga", "checkIn": "2026-10-06", "startDate": "2026-10-06", "bookingCode": "3128159", "description": "Duración: 10 hs | Idioma: es | Incluye: Traslado en autobús con aire acondicionado. Guía en español. Entrada a la Mezquita Catedral, la Sinagoga y los jardines. | No incluye: Comida y bebidas. | Tour desde Málaga. Estado: Confirmada / Emitida. Grupo de reserva #1344459. Inicio del servicio 06/10/2026 y fin del servicio 06/10/2026.", "destination": "Córdoba", "serviceName": "Excursión a Córdoba con visita a la Mezquita", "departureDate": "2026-10-06", "departureTime": "08:10", "costDividerMode": "per_passenger", "cancellationDate": "2026-09-25", "confirmationNumber": "3128159"}, "economics": {"iva": 3.6, "comision": 28.42, "gastosAdm": 1.92, "adjustments": [], "baseNetCost": 224.13, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 218.61}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "x2w6v65gi", "type": "service", "price": 227.08, "title": "Excursión a Nerja, Frigiliana y El Acebuchal en grupo reducido", "details": {"date": "2026-10-08", "time": "10:00", "origin": "Málaga, Málaga, España", "checkIn": "2026-10-08", "classType": "Tour en español", "startDate": "2026-10-08", "bookingCode": "3156169", "description": "Duración: 7 hs | Idioma: Tour en español | Incluye: Transporte en minibús. Guía en español. Grupo reducido de máximo 7 personas. | No incluye: Comidas y bebidas. | Reserva confirmada y emitida. Localizador 3156169. Grupo de reserva #1371019. Inicio y fin del servicio el 08/10/2026. Ciudad: Málaga, Málaga, España. Idioma: es. Pasajeros: Cristina Yolanda Atashian y JUAN JOSE CAPPELLO, ambos adultos de 30 años.", "destination": "Nerja, Frigiliana y El Acebuchal", "serviceName": "Excursión a Nerja, Frigiliana y El Acebuchal en grupo reducido", "departureDate": "2026-10-08", "departureTime": "10:00", "costDividerMode": "per_passenger", "cancellationDate": "2026-09-26", "confirmationNumber": "3156169"}, "economics": {"iva": 3.65, "comision": 28.79, "gastosAdm": 1.94, "adjustments": [], "baseNetCost": 227.08, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 221.49}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "7b5c5727o", "type": "transfer", "price": 197.53, "details": {"date": "2026-10-11", "time": "10:00", "origin": "Hotel MS Maestranza, Avenida Cánovas del Castillo 1, Málaga, Spain", "airline": "Mozio", "checkIn": "2026-10-11", "classType": "Sedan Standard", "startDate": "2026-10-11", "bookingCode": "MOZ9079480", "description": "Duración: 65 minutos aprox. | Incluye: Early driver details | Traslado privado de ida (solo ida/in) para 2 equipajes por persona, capacidad 4 personas. Estado: Confirmada y Emitida. Grupo de reserva #1397010.", "destination": "Hotel Boutique La Brisa del Mar, Calle Málaga 78, Estepona, Spain", "isRoundTrip": true, "departureDate": "2026-10-11", "departureTime": "10:00", "trainOperator": "Mozio", "costDividerMode": "divided_total", "cancellationDate": "2026-10-08", "confirmationNumber": "MOZ9079480"}, "economics": {"iva": 3.17, "comision": 25.05, "gastosAdm": 1.69, "adjustments": [], "baseNetCost": 197.53, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 192.67}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "8ldbk5fvf", "type": "hotel", "details": {"rooms": [{"id": "1", "type": "Standard Double Room, Ground Floor", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "checkIn": "2026-10-11", "checkOut": "2026-10-19", "hotelName": "Hotel Boutique La Brisa del Mar", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3128129"}, "economics": {"iva": 10.95, "comision": 171.4, "gastosAdm": 12.6, "adjustments": [], "baseNetCost": 0, "suplementos": 114.87, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 1318.43}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "3o4b50u0v", "type": "service", "title": "Tour por Gibraltar", "details": {"date": "2026-10-14", "time": "09:30", "origin": "McDonald's Estepona, Parada Bus, Avenida Litoral, Estepona, España", "airline": "WORLD EXPERIENCE SRL / I Need Tours / Juan Toselli", "checkIn": "2026-10-14", "classType": "Adult with pickup", "startDate": "2026-10-14", "bookingCode": "I1EI37", "description": "Idioma: Espanhol From Estepona in Spanish | Incluye: Transporte en autocar con aire acondicionado. Guía local. Guía acompañante multilingüe. Tiempo libre. Entrada a las cuevas de San Miguel. | No incluye: Recogida y regreso al hotel del cliente. Transporte hasta el punto de encuentro. Entradas, comidas y bebidas excepto si se especifica expresamente en las inclusiones del tour. Otro servicio no especificado. | Reserva confirmada por I Need Tours. Reserva a nombre de cristina atashian. Pasajeros: cristina atashian y JUAN JOSE CAPELLO. Contacto local: 0034 933176454. El voucher indica que se debe presentarse 20 minutos antes de la hora de salida.", "destination": "Gibraltar", "serviceName": "Tour por Gibraltar", "departureDate": "2026-10-14", "departureTime": "09:30", "trainOperator": "WORLD EXPERIENCE SRL / I Need Tours / Juan Toselli", "costDividerMode": "per_passenger", "confirmationNumber": "I1EI37"}, "economics": {"iva": 3.19, "comision": 25.17, "gastosAdm": 1.7, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 193.58}, "providerId": ""}, {"id": "y706czbmy", "type": "transfer", "price": 197.53, "details": {"date": "2026-10-19", "time": "09:55", "rooms": [{"id": "1789438117562", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 1}], "origin": "Hotel Boutique La Brisa del Mar, Calle Malaga 78, Estepona, Spain", "airline": "Mozio", "checkIn": "2026-10-19", "classType": "Sedan Standard", "hotelName": "Hotel Boutique La Brisa del Mar", "startDate": "2026-10-19", "bookingCode": "MOZ9079459", "description": "Duración: 65 minutos aprox. | Incluye: Early driver details | Traslado privado de solo ida (in) desde Hotel Boutique La Brisa del Mar hasta Malaga Train Station. Capacidad: 4 personas. Equipaje por persona: 2.", "destination": "Malaga Train Station, Malaga Train Station, España", "isRoundTrip": true, "departureDate": "2026-10-19", "departureTime": "09:55", "trainOperator": "Mozio", "costDividerMode": "divided_total", "cancellationDate": "2026-10-16", "confirmationNumber": "MOZ9079459"}, "economics": {"iva": 3.17, "comision": 25.05, "gastosAdm": 1.69, "adjustments": [], "baseNetCost": 197.53, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 192.67}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "biaoj7ozx", "type": "train", "price": 48.85, "details": {"date": "2026-10-19", "time": "11:56", "rooms": [{"id": "1789438189479", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "origin": "MALAGA MARIA Z", "airline": "Rail Europe / Renfe Viajeros S.M.E.", "checkIn": "2026-10-19", "classType": "AVE ESTANDAR", "startDate": "2026-10-19", "arrivalDate": "", "arrivalTime": "14:46", "bookingCode": "ZHYCW9", "destination": "MADRID P.ATOCHA", "seatDetails": "", "trainNumber": "AVE 02123", "departureDate": "2026-10-19", "departureTime": "11:56", "trainOperator": "Renfe", "documentNumber": "2034", "costDividerMode": "per_passenger", "confirmationNumber": "ZHYCW9"}, "economics": {"iva": 0.3, "comision": 1.51, "gastosAdm": 1.43, "adjustments": [], "baseNetCost": 44.41, "suplementos": 25.41, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 120.54}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "fuorjzb6p", "type": "hotel", "price": 1155.49, "details": {"rooms": [{"id": "1", "type": "Double Room, Courtyard View", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "checkIn": "2026-10-19", "checkOut": "2026-10-23", "hotelName": "B&B Hotel Madrid Centro Plaza Mayor", "costDividerMode": "divided_total", "cancellationDate": "2026-10-16", "confirmationNumber": "3128131"}, "economics": {"iva": 8.7, "comision": 136.33, "gastosAdm": 9.99, "adjustments": [], "baseNetCost": 1155.49, "suplementos": 88.1, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 1048.7}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}]		\N	\N	VOLANDA, CRISTINA			1	["8c3e743f-52ab-43f9-bb43-057957b9e9e8"]	[{"id": "ptx5fg4jy", "date": "2026-08-15", "amount": 5750, "method": "cash", "reference": ""}]	[{"id": "277qml1tm", "date": "2026-09-14", "amount": 1971.08, "method": "cash", "reference": "", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "8e8pg63x2", "date": "2026-09-14", "amount": 146.63, "method": "cash", "reference": "", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}]	0.00		[]	\N
7c97767c-e26d-4a82-beab-68d2221a5737	88be8917-9d66-4162-b0ad-28aad8e3bdc8	Viaje Chile Virginia Aranes	Chile	USD	sold	\N	\N	2026-08-20 23:05:48.209182	2026-09-15 09:49:00.166692	\N	[]	[{"id": "etm3m2knz", "type": "flight", "details": {"type": "ROUND_TRIP", "airline": "Sky Airline", "baggage": {"hasHand": true, "handDesc": "", "hasCarryOn": true, "hasChecked": true, "carryOnDesc": "", "checkedDesc": ""}, "segments": [{"id": "1", "to": "SCL", "from": "AEP", "stops": "Directo", "arrivalDate": "22/09/2026", "arrivalTime": "14:25", "flightNumber": "H20538", "departureDate": "22/09/2026", "departureTime": "11:55"}, {"id": "2", "to": "AEP", "from": "SCL", "stops": "Directo", "arrivalDate": "25/09/2026", "arrivalTime": "20:40", "flightNumber": "H20535", "departureDate": "25/09/2026", "departureTime": "18:35"}], "bookingCode": "DRDSWN", "costDividerMode": "divided_total"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 715}, "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}, {"id": "hao9hgxae", "type": "hotel", "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Desayuno Buffet", "price": 0, "paxCount": 2}], "checkIn": "2026-09-22", "checkOut": "2026-09-25", "hotelName": "NH Collection Plaza Santiago", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3140104"}, "economics": {"iva": 4.36, "comision": 69.71, "gastosAdm": 4.66, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 536.25}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}]		\N	\N	ARANES, VIRGINIA			2	["dbe0f0e3-1c53-40bf-ada3-17375e2d4431"]	[{"id": "8r87hhmpu", "date": "2026-08-19", "amount": 715, "method": "transfer", "reference": ""}, {"id": "rrorsb397", "date": "2026-09-15", "amount": 545, "method": "transfer", "reference": ""}]	[{"id": "t37e6qdil", "date": "2026-08-12", "amount": 715, "method": "transfer", "reference": "", "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}, {"id": "xi34irknx", "date": "2026-09-14", "amount": 475.87, "method": "cash", "reference": "BACK", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}]	0.00		[]	\N
f3d92d22-1996-4352-b9aa-277e03aaf381	9e84636f-5716-479b-9884-91fb850e1e84	Viaje Europa 		USD	sold	\N	\N	2026-09-13 19:47:10.893888	2026-09-14 22:23:28.488562	\N	[]	[{"id": "4rxj7r23e", "type": "flight", "details": {"type": "MULTI", "airline": "Air Europa / Swiss International Air Lines", "baggage": {"hasHand": true, "handDesc": "", "hasCarryOn": true, "hasChecked": true, "carryOnDesc": "1 Piece(s) permitido", "checkedDesc": ""}, "segments": [{"id": "1", "to": "MAD", "from": "EZE", "stops": "Directo", "arrivalDate": "09/10/2026", "arrivalTime": "05:10", "flightNumber": "UX042", "departureDate": "08/10/2026", "departureTime": "12:10"}, {"id": "2", "to": "AEP", "from": "ZRH", "stops": "1 Escala", "arrivalDate": "26/10/2026", "arrivalTime": "12:00", "flightNumber": "LX092 / LX9760", "departureDate": "25/10/2026", "departureTime": "22:40", "layoverDetails": "Conexión en GRU (Llegada 06:40 - Sale 09:05) | Vuelos: LX092 + LX9760"}], "bookingCode": "CEWWVK", "costDividerMode": "per_passenger"}, "economics": {"iva": 0, "comision": 62, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [{"id": "0gzz6", "label": "ASIENTO AIR EUROPA", "amount": 140}, {"id": "bqadu", "label": "ASIENTO SWISS AIRLINE", "amount": 141}], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 2340}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "v7kmsdqgn", "type": "flight", "details": {"type": "ONE_WAY", "airline": "Air Europa", "baggage": {"hasHand": true, "handDesc": "Artículo personal", "hasCarryOn": true, "hasChecked": true, "carryOnDesc": "Equipaje de mano 1 pieza 10KG", "checkedDesc": "Equipaje en bodega 1 pieza"}, "segments": [{"id": "1", "to": "BRU", "from": "MAD", "stops": "Directo", "arrivalDate": "12/10/2026", "arrivalTime": "09:45", "flightNumber": "UX1171", "departureDate": "12/10/2026", "departureTime": "07:20"}], "bookingCode": "9X5E4P", "costDividerMode": "per_passenger"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 198}, "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}, {"id": "3jv6lq84e", "type": "hotel", "price": 211.06, "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Desayuno Buffet", "price": 0, "paxCount": 1}], "checkIn": "2026-10-12", "checkOut": "2026-10-13", "hotelName": "Hotel Lucca, NAALDENSTRAAT 30, 8000, Bruges, Belgium", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3098146"}, "economics": {"iva": 3.39, "comision": 26.76, "gastosAdm": 1.81, "adjustments": [], "baseNetCost": 184.3, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 26.76, "totalComisionable": 205.87}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "pdenfm1ef", "type": "hotel", "price": 221.21, "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 1}], "checkIn": "2026-10-13", "checkOut": "2026-10-14", "hotelName": "easyHotel Brussels City Centre", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3098176"}, "economics": {"iva": 2.67, "comision": 28.16, "gastosAdm": 1.89, "adjustments": [], "baseNetCost": 221.21, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 216.65}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "l2spktihy", "type": "train", "price": 21.6, "details": {"date": "2026-10-12", "origin": "BRUSELAS", "checkIn": "2026-10-12", "classType": "2", "arrivalDate": "", "arrivalTime": "", "bookingCode": "7748 40434261 5BUTF1", "destination": "BRUJAS", "seatDetails": "", "trainNumber": "1088", "departureDate": "2026-10-12", "departureTime": "", "trainOperator": "BRUSELAS / BRUJAS", "costDividerMode": "per_passenger", "confirmationNumber": "7748 40434261 5BUTF1"}, "economics": {"iva": 0, "comision": 0.61, "gastosAdm": 0, "adjustments": [], "baseNetCost": 21.6, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 37.43}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "1789435210707", "type": "train", "price": 21.6, "details": {"date": "2026-10-13", "origin": "BRUGGE", "checkIn": "2026-10-13", "classType": "2", "arrivalDate": "", "arrivalTime": "", "bookingCode": "XRCGNLW", "destination": "BRUXELLES-MIDI", "seatDetails": "", "trainNumber": "1088", "departureDate": "2026-10-13", "departureTime": "", "trainOperator": "BRUSELAS / BRUJAS", "costDividerMode": "per_passenger", "confirmationNumber": "XRCGNLW"}, "economics": {"iva": 0, "comision": 0.61, "gastosAdm": 0, "adjustments": [], "baseNetCost": 21.6, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 37.43}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "1789435233342", "type": "train", "price": 21.6, "details": {"date": "2026-10-14", "time": "15:53", "origin": "Brussels Midi / Zuid", "airline": "Eurostar", "checkIn": "2026-10-14", "classType": "Plus", "arrivalDate": "", "arrivalTime": "17:50", "bookingCode": "546260380", "destination": "Amsterdam Centraal", "seatDetails": "", "trainNumber": "9351", "departureDate": "2026-10-14", "departureTime": "15:53", "trainOperator": "Eurostar", "costDividerMode": "per_passenger", "confirmationNumber": "546260380"}, "economics": {"iva": 0, "comision": 2.9, "gastosAdm": 0, "adjustments": [], "baseNetCost": 21.6, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 1, "commissionValue": 10, "totalComisionable": 153.31}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}]		\N	\N	MAYORGA SOMERVILLE, HORACIO MARCELO	2026-10-08	2026-10-25	1	[]	[{"id": "f1liizqxk", "date": "2026-09-06", "amount": 3500, "method": "transfer", "reference": ""}]	[]	0.00		[]	\N
5b131cd9-564a-4ff5-a2f6-f79bb9221054	6784de12-6f47-47d6-b584-54b9603cecb7	Juan Otero viaje relampago	Maceio	USD	sold	\N	\N	2026-08-30 23:01:29.646371	2026-09-14 21:58:57.409797	\N	[]	[{"id": "dc0svc3ba", "type": "flight", "details": {"type": "ROUND_TRIP", "airline": "GOL", "baggage": {"hasHand": true, "handDesc": "", "hasCarryOn": true, "hasChecked": false, "carryOnDesc": "", "checkedDesc": ""}, "segments": [{"id": "1", "to": "MCZ", "from": "EZE", "stops": "1 Escala", "arrivalDate": "15/09/2026", "arrivalTime": "01:35", "flightNumber": "G37655 / G32080", "departureDate": "14/09/2026", "departureTime": "18:30", "layoverDetails": "Conexión en GIG (Llegada 21:25 - Sale 23:00) | Vuelos: G37655 + G32080"}, {"id": "2", "to": "EZE", "from": "MCZ", "stops": "1 Escala", "arrivalDate": "21/09/2026", "arrivalTime": "12:25", "flightNumber": "G32081 / G37652", "departureDate": "21/09/2026", "departureTime": "03:45", "layoverDetails": "Conexión en GIG (Llegada 06:25 - Sale 08:55) | Vuelos: G32081 + G37652"}], "bookingCode": "IZLWPK", "costDividerMode": "divided_total"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 1540.86}, "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}, {"id": "becjhgrst", "type": "hotel", "price": 694.77, "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Desayuno Buffet", "price": 0, "paxCount": 2}], "checkIn": "2026-09-14", "checkOut": "2026-09-20", "hotelName": "Maceió Atlantic Suites", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3173171"}, "economics": {"iva": 8.39, "comision": 88.46, "gastosAdm": 5.94, "adjustments": [], "baseNetCost": 606.32, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 88.46, "totalComisionable": 680.44}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "vezqjxiun", "type": "transfer", "price": 41.15, "details": {"date": "2026-09-15", "time": "01:35", "origin": "Maceió, Brasil (MCZ-Zumbi dos Palmares Intl.)", "airline": "INeedTours", "checkIn": "2026-09-15", "endDate": "2026-09-15", "checkOut": "2026-09-15", "planType": "Daily", "classType": "Solo ida (in)", "startDate": "2026-09-15", "bookingCode": "3171686", "description": "Comfort Car", "destination": "Maceió Atlantic Suites, Av. Álvaro Otacílio 4065, Maceio, Brazil", "isRoundTrip": true, "trainNumber": "2080 - Gol", "departureDate": "2026-09-15", "departureTime": "01:35", "trainOperator": "INeedTours", "costDividerMode": "divided_total", "confirmationNumber": "3171686"}, "economics": {"iva": 0.72, "comision": 5.65, "gastosAdm": 0.42, "adjustments": [], "baseNetCost": 41.15, "suplementos": 3.51, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 43.5}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "v9rh84v7h", "type": "transfer", "price": 38.12, "details": {"date": "2026-09-20", "time": "03:45", "origin": "Maceió Atlantic Suites, Av. Álvaro Otacílio 4065, Maceio, Brazil", "airline": "INeedTours", "checkIn": "2026-09-20", "endDate": "2026-09-21", "checkOut": "2026-09-21", "planType": "Daily", "classType": "Comfort Car", "startDate": "2026-09-20", "bookingCode": "3171685", "destination": "Maceió, Brasil - MCZ-Zumbi dos Palmares Intl.", "isRoundTrip": true, "trainNumber": "2081 - Gol", "flightNumber": "2081 - Gol", "departureDate": "2026-09-21", "departureTime": "03:45", "trainOperator": "INeedTours", "costDividerMode": "divided_total", "confirmationNumber": "3171685"}, "economics": {"iva": 0.71, "comision": 5.65, "gastosAdm": 0.38, "adjustments": [], "baseNetCost": 38.12, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 43.5}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "bd1mz6sbg", "type": "assistance", "details": {"date": "2026-09-14", "airline": "Assist Card", "checkIn": "2026-09-14", "endDate": "2026-09-21", "checkOut": "2026-09-21", "planType": "Daily", "startDate": "2026-09-14", "bookingCode": "540 25593931 05C PR043 / 1", "description": "Resumen de prestaciones de Assist Card para JUAN PATRICIO OTERO. N° ASSIST CARD: 540 25593931 05C PR043 / 1. Vigencia del servicio: 14/09/2026 al 21/09/2026 inclusive. Cobertura hasta USD 150.000.", "departureDate": "2026-08-31", "trainOperator": "Assist Card", "documentNumber": "22953112", "costDividerMode": "divided_total", "assistanceCompany": "Assist Card", "confirmationNumber": "540 25593931 05C PR043 / 1"}, "economics": {"iva": 0, "comision": 66.56, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 166.4}, "providerId": "1cf8e6d2-152a-40b8-ac08-7d1dc512e220"}]		\N	\N	Otero, Juan	2026-09-14	2026-09-21	2	[]	[{"id": "vchg78jls", "date": "2026-09-12", "amount": 2626, "method": "cash", "reference": "Esta en lo de Vicky en EFVO"}]	[{"id": "f2l7aofek", "date": "2026-09-12", "amount": 99.56, "method": "account", "reference": "99.56", "providerId": "1cf8e6d2-152a-40b8-ac08-7d1dc512e220"}, {"id": "walwhaqf5", "date": "2026-09-01", "amount": 1540.86, "method": "transfer", "reference": "42788775650", "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}, {"id": "6md0r33ni", "date": "2026-09-14", "amount": 684.62, "method": "cash", "reference": "BACK", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}]	0.00	\nCotización de Viaje: Maceió, Brasil\n\n1. Vuelos - GOL Linhas Aéreas\n\nIda: Buenos Aires (EZE) a Maceió (MCZ)\n\nSalida: 18:30 h (EZE) - Llegada: 01:35 h +1 (MCZ)\n\nDuración: 07h 05m (Escala en GIG)\n\nEquipaje: Incluye artículo personal y equipaje de mano (carry-on).\n\nVuelta: Maceió (MCZ) a Buenos Aires (EZE)\n\nSalida: 03:45 h (MCZ) - Llegada: 12:25 h (EZE)\n\nDuración: 08h 40m (Escala en GIG)\n\nEquipaje: Incluye artículo personal y equipaje de mano (carry-on).\n\nTarifa Aérea: USD 1.510,14 (Incluye el 1.5% de recargo sobre la base de USD 1.487,82).\n\n2. Alojamiento - Maceió Atlantic Suites (4 Estrellas)\n\nFechas: 14/09/2026 al 21/09/2026 (7 noches)\n\nOcupación: 2 personas\n\nHabitación: Suite\n\nRégimen: Alojamiento y Desayuno\n\nTarifa: USD 865,00\n\nCondición de la tarifa: Atención: Esta tarifa es no reembolsable (cancelación con cargo completo). Debido a la cercanía de la fecha de viaje, no admite modificaciones ni devoluciones.\n\nAnálisis del Hotel:\n\nPros:\n\nUbicación inmejorable en el barrio de Jatiúca, justo frente a la playa y rodeado de servicios útiles como farmacias, supermercados y una gran variedad de restaurantes.\n\nLas habitaciones en categoría suite son muy amplias, cómodas y cuentan con excelentes vistas al mar.\n\nDestaca la amabilidad y buena predisposición del personal del hotel.\n\nContras:\n\nLa playa que se encuentra frente al hotel tiene oleaje fuerte; para disfrutar de las clásicas "piscinas naturales" mansas de la zona, es necesario desplazarse un poco.\n\nCiertos sectores del edificio tienen un estilo un poco anticuado y requieren de renovación o mayor mantenimiento (como los pasillos o algunos detalles de los baños).\n\nEl área designada para el desayuno suele ser muy concurrida en los horarios pico y puede ser ventosa.\n\n3. Servicios Adicionales\n\nTraslados: Servicio In/Out (Aeropuerto - Hotel - Aeropuerto) por USD 100,00.\n\nAsistencia Médica: Seguro de viaje con cobertura de hasta USD 100.000 por USD 300,00.\n\n4. Resumen Final\n\nVuelos (Tarifa ajustada): USD 1.510,14\n\nHotel Maceió Atlantic Suites: USD 865,00\n\nTraslados (Ida y Vuelta): USD 100,00\n\nAsistencia Médica (Cobertura 100k): USD 300,00\n\nTOTAL: USD 2.775,14\n\n\n🌴 Paquete a Natal / Pipa, Brasil 🌴\n\n📅 Fechas: 14/09/2026 al 21/09/2026 (7 noches)\n\n✈️ Vuelos por GOL Linhas Aéreas\n\n🛫 VUELO DE IDA (14/09)\nDuración total: 07h 50m\n• 18:30 h – Salida desde Buenos Aires (EZE)\n• 21:25 h – Llegada a Río de Janeiro (GIG)\n⏳ Escala de 1h 50m en el aeropuerto\n• 23:15 h – Salida desde Río de Janeiro (GIG)\n• 02:20 h (+1) – Llegada a Natal (NAT) el 15/09\n\n🛬 VUELO DE VUELTA (21/09)\nDuración total: 08h 25m\n• 12:35 h – Salida desde Natal (NAT)\n• 16:10 h – Llegada a San Pablo (GRU)\n⏳ Escala de 1h 50m en el aeropuerto\n• 18:00 h – Salida desde San Pablo (GRU)\n• 21:00 h – Llegada a Buenos Aires (AEP)\n\n🎒 Equipaje: Incluye 1 artículo personal y 1 equipaje de mano (carry-on).\n(Tarifa aérea ajustada: USD 1.466,55)\n\n🏨 OPCIONES DE ALOJAMIENTO EN PIPA (4 Estrellas)\nAmbas opciones incluyen régimen de alojamiento y desayuno.\n\nOpción 1: Pousada Dos Girassois (Habitación Superior)\n• Tarifa del hotel: USD 845,00\n⚖️ Detalles:\n• Pros: Entorno natural hermoso con mucha vegetación, estilo cabañas muy tranquilo, y una excelente cercanía a la famosa Praia do Amor.\n• Contras: El predio tiene desniveles y escaleras, lo que puede ser incómodo si prefieren evitar caminar en subida. Está un poco más retirado del centro comercial.\n\nOpción 2: Hotel Pipa Atlântico (Suite Deluxe Primer Piso)\n• Tarifa del hotel: USD 1.029,00\n⚖️ Detalles:\n• Pros: Ubicación inmejorable en pleno centro (Avenida Baía dos Golfinhos), a pasos de todos los bares, restaurantes y tiendas. Cuenta con una piscina enorme.\n• Contras: Al estar en el corazón del centro, puede haber un poco más de ruido por la noche. Además, al ser un complejo tan grande, pierde un poco el ambiente íntimo o "boutique" característico de Pipa.\n\n🚐 Servicios Adicionales Incluidos (en ambas opciones):\n• Traslados: Ida y vuelta (Aeropuerto Natal - Hotel Pipa - Aeropuerto Natal) por USD 170,00.\n• Asistencia Médica: Seguro de viaje por USD 200,00.\n\n💰 PRECIOS TOTALES FINALES\n(Incluyen Vuelos + Hotel + Traslados + Asistencia)\n\n👉 TOTAL con Opción 1 (Dos Girassois): USD 2.681,55\n👉 TOTAL con Opción 2 (Pipa Atlântico): USD 2.865,55	[]	\N
8e0a776d-0e8b-457e-b064-af9e8ddb9448	9e348e4d-03e3-417f-8036-53fb225e8203	Luciana Abadie	Europa	USD	sold	\N	\N	2026-06-21 20:46:09.208604	2026-08-17 20:54:48.769417	\N	[]	[{"id": "6b7yq4pj9", "type": "flight", "details": {"type": "ROUND_TRIP", "airline": "Aerolineas Argentinas", "baggage": {"hasHand": true, "handDesc": "", "hasCarryOn": true, "hasChecked": false, "carryOnDesc": "", "checkedDesc": ""}, "segments": [{"id": "1", "to": "MAD", "from": "EZE", "stops": "Directo", "arrivalDate": "21/07/2026", "arrivalTime": "17:10", "flightNumber": "AR1132", "departureDate": "20/07/2026", "departureTime": "23:55"}, {"id": "2", "to": "EZE", "from": "MAD", "stops": "Directo", "arrivalDate": "05/08/2026", "arrivalTime": "19:00", "flightNumber": "AR1135", "departureDate": "05/08/2026", "departureTime": "10:55"}], "bookingCode": "UHZMNR", "costDividerMode": "divided_total"}, "economics": {"iva": 0, "comision": 40, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 3430}, "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}, {"id": "5h56z5b47", "type": "transfer", "details": {"date": "2026-07-21", "time": "17:10", "origin": "MADRID BARAJAS", "description": "X", "destination": "HOTEL PETIT PRECIADOS", "isRoundTrip": true, "flightNumber": "1132", "costDividerMode": "divided_total", "confirmationNumber": "3075761"}, "economics": {"iva": 0, "comision": 8.45, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 64}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "m7e8yv9f1", "type": "train", "details": {"date": "2026-07-24", "time": "09:50", "origin": "Madrid-Puerta De Atocha", "airline": "Renfe", "checkIn": "2026-07-24", "classType": "Reserva de asiento incluida", "arrivalDate": "", "arrivalTime": "12:52", "bookingCode": "S752569378", "destination": "Malaga-Maria Zambrano", "seatDetails": "", "trainNumber": "ave 2092", "departureDate": "2026-07-24", "departureTime": "09:50", "trainOperator": "Renfe", "costDividerMode": "divided_total"}, "economics": {"iva": 0.3, "comision": 0.6, "gastosAdm": 1.43, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [{"id": "xmd5s", "label": "TASAS", "amount": 25.27}], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 119.9}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "omtrffup8", "type": "train", "details": {"date": "2026-08-03", "time": "12:50", "origin": "Malaga-Maria Zambrano", "airline": "Renfe", "checkIn": "2026-08-03", "classType": "Reserva de asiento incluida", "arrivalDate": "", "arrivalTime": "15:49", "bookingCode": "S019866669", "destination": "Madrid-Puerta De Atocha", "seatDetails": "", "trainNumber": "AVE - 2133", "flightNumber": "ave - 2133", "departureDate": "2026-08-03", "departureTime": "12:50", "trainOperator": "Renfe", "costDividerMode": "divided_total"}, "economics": {"iva": 0.3, "comision": 0.6, "gastosAdm": 1.43, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [{"id": "8t1v8", "label": "TASAS", "amount": 25.27}], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 119.9}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "n2zi9oxtj", "type": "assistance", "details": {"date": "2026-07-20", "airline": "Assist Card", "checkIn": "2026-07-20", "endDate": "2026-08-05", "checkOut": "2026-08-05", "startDate": "2026-07-20", "bookingCode": "540 25243904 05O RIC45 / 1", "description": "Resumen de prestaciones de Assist Card para LUCIANA CECILIA ABADIE. Vigencia del servicio del 20/07/2026 al 05/08/2026 inclusive. Cobertura máxima global USD 100.000.", "departureDate": "2026-05-15", "trainOperator": "Assist Card", "documentNumber": "24820049", "costDividerMode": "divided_total", "assistanceCompany": "Assist Card", "confirmationNumber": "540 25243904 05O RIC45 / 1"}, "economics": {"iva": 0, "comision": 93, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 2, "commissionValue": 10, "totalComisionable": 310}, "providerId": "1cf8e6d2-152a-40b8-ac08-7d1dc512e220"}]		4030.42	3200.00	ABADIE, LUCIANA CECILIA	2026-07-20	2026-08-05	2	["9f036c09-6cd3-489f-a82b-1b1b1df4d2a1"]	[{"id": "db35tyqt5", "date": "2026-07-17", "amount": 3430, "method": "cash", "reference": ""}, {"id": "zkxd1w6wi", "date": "2026-07-17", "amount": 663, "method": "cash", "reference": ""}]	[{"id": "rxnjyhyyk", "date": "2026-07-17", "amount": 293, "method": "cash", "reference": "", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "qmdi5h497", "date": "2026-07-17", "amount": 55.55, "method": "transfer", "reference": "", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "8tex0zzzf", "date": "2026-07-17", "amount": 217, "method": "cash", "reference": "se pago con una comisiòn", "providerId": "1cf8e6d2-152a-40b8-ac08-7d1dc512e220"}, {"id": "t02aebyzs", "date": "2026-07-17", "amount": 3390, "method": "transfer", "reference": "", "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}]	0.00		[]	\N
97bb11e7-b9b1-43f7-9008-a1fcb1f760bf	bea185f0-f492-4809-a252-8bd9815a754d	Viaje Familia OTERO - Fines de Mayo	Europa (Madrid & Barcelona)	USD	follow_up	\N	\N	2026-07-17 16:35:47.505957	2026-08-20 23:09:55.267488	\N	[]	[{"id": "item-1", "type": "flight", "price": 1700, "details": {"type": "ROUND_TRIP", "airline": "Iberia Airlines", "baggage": {"hasHand": true, "handDesc": "Mochila", "hasCarryOn": true, "hasChecked": true, "carryOnDesc": "10kg", "checkedDesc": "23kg"}, "segments": [{"id": "seg-1", "to": "MAD", "from": "EZE", "arrivalDate": "11/10/2026", "arrivalTime": "14:20", "departureDate": "10/10/2026", "departureTime": "21:40"}, {"id": "seg-2", "to": "EZE", "from": "BCN", "arrivalDate": "25/10/2026", "arrivalTime": "04:30", "departureDate": "24/10/2026", "departureTime": "18:10"}], "bookingCode": "IB-78492X"}, "economics": {"adjustments": [], "baseNetCost": 1400, "pricingModel": "total", "commissionType": "fixed", "passengerCount": 2, "commissionValue": 300}, "providerId": ""}, {"id": "item-2", "type": "hotel", "price": 1100, "details": {"rooms": [{"id": "r-1", "type": "Doble Deluxe", "board": "Desayuno Buffet", "paxCount": 2}], "checkIn": "11/10/2026", "checkOut": "16/10/2026", "hotelName": "Hotel Riu Plaza España", "confirmationNumber": "MAD-99214"}, "economics": {"adjustments": [], "baseNetCost": 900, "pricingModel": "total", "commissionType": "fixed", "passengerCount": 2, "commissionValue": 200}, "providerId": ""}, {"id": "item-3", "type": "train", "price": 250, "details": {"origin": "Madrid (Atocha)", "classType": "Primera / Confort", "arrivalDate": "16/10/2026", "arrivalTime": "13:00", "bookingCode": "RENFE-8821X", "destination": "Barcelona (Sants)", "seatDetails": "Coche 4 - Asientos 12A y 12B", "trainNumber": "AVE 03141", "departureDate": "16/10/2026", "departureTime": "10:30", "trainOperator": "Renfe AVE"}, "economics": {"adjustments": [], "baseNetCost": 200, "pricingModel": "total", "commissionType": "fixed", "passengerCount": 2, "commissionValue": 50}, "providerId": ""}, {"id": "item-4", "type": "hotel", "price": 1350, "details": {"rooms": [{"id": "r-2", "type": "Junior Suite", "board": "Desayuno", "paxCount": 2}], "checkIn": "16/10/2026", "checkOut": "24/10/2026", "hotelName": "Hotel Majestic BCN 5*", "confirmationNumber": "BCN-55102"}, "economics": {"adjustments": [], "baseNetCost": 1100, "pricingModel": "total", "commissionType": "fixed", "passengerCount": 2, "commissionValue": 250}, "providerId": ""}, {"id": "item-5", "type": "transfer", "price": 100, "details": {"date": "11/10/2026", "time": "15:00", "origin": "Aeropuerto Barajas (MAD)", "destination": "Hotel Riu Plaza España", "isRoundTrip": true, "confirmationNumber": "TR-MAD-01"}, "economics": {"adjustments": [], "baseNetCost": 80, "pricingModel": "total", "commissionType": "fixed", "passengerCount": 2, "commissionValue": 20}, "providerId": ""}]		921.12	700.00	VALENTINA, OTERO			1	[]	[]	[]	0.00		[]	\N
b53efbc7-ac18-44bc-9412-90a59c0d761a	c3b95aae-14b9-47fb-93a7-db2c5b497c73	Familia	Europa (Madrid & Barcelona)	USD	sold	\N	\N	2026-07-11 13:07:38.668575	2026-09-14 21:59:51.857111	\N	[]	[{"id": "qum7ydd4h", "type": "flight", "details": {"type": "ONE_WAY", "airline": "Smartwings", "baggage": {"hasHand": false, "handDesc": "", "hasCarryOn": false, "hasChecked": true, "carryOnDesc": "", "checkedDesc": "1 Piece(s) por pasajero"}, "segments": [{"id": "1", "to": "PRG", "from": "AGP", "stops": "Directo", "arrivalDate": "01/09/2026", "arrivalTime": "13:25", "flightNumber": "QS1155", "departureDate": "01/09/2026", "departureTime": "10:10"}], "bookingCode": "BSWTSK", "costDividerMode": "divided_total"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 1361.95}, "providerId": "6a54dea5-a3ba-40f9-8321-23ffb7f42380"}, {"id": "x4cu2h4fe", "type": "flight", "details": {"type": "ONE_WAY", "airline": "Ryanair", "baggage": {"hasHand": true, "handDesc": null, "hasCarryOn": true, "hasChecked": true, "carryOnDesc": null, "checkedDesc": null}, "segments": [{"id": "1", "to": "AGP", "from": "BUD", "stops": "Directo", "arrivalDate": "10/09/2026", "arrivalTime": "14:10", "flightNumber": "FR3571", "departureDate": "10/09/2026", "departureTime": "10:30"}], "bookingCode": "", "costDividerMode": "divided_total"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 635.42}, "itemStatus": "confirmed", "providerId": "47e0556b-9e5f-48fd-bf60-6e246a315d0b", "assignedPassengerIds": ["c3b95aae-14b9-47fb-93a7-db2c5b497c73", "a2dd445b-56f3-4a4e-8cdb-e6c842ec1e0a", "90ffa023-46f6-4675-863d-9bc64f81ba1b", "87a2ca8b-c509-457f-a40d-554e2667a490"]}, {"id": "q5y8lfcny", "type": "flight", "details": {"type": "ONE_WAY", "airline": "Iberia", "baggage": {"hasHand": true, "handDesc": "", "hasCarryOn": true, "hasChecked": true, "carryOnDesc": "", "checkedDesc": ""}, "segments": [{"id": "1", "to": "MAD", "from": "BUD", "stops": "Directo", "arrivalDate": "10/09/2026", "arrivalTime": "15:45", "flightNumber": "IB0870", "departureDate": "10/09/2026", "departureTime": "12:25"}], "bookingCode": "BS5G8G", "costDividerMode": "divided_total"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 383}, "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc", "assignedPassengerIds": ["c02436f5-fffe-40aa-8d78-fa6cda57df29", "9538c67c-5ae7-4d0d-a8c4-778049645bf5"]}, {"id": "0m91gn6w2", "type": "train", "details": {"date": "2026-08-24", "time": "11:55", "origin": "Madrid Atocha - Estación de tren", "airline": "Iryo", "checkIn": "2026-08-24", "classType": "Reserva de asiento incluida", "arrivalDate": "", "arrivalTime": "14:44", "bookingCode": "", "destination": "Málaga María Zambrano - Estación de tren", "seatDetails": "", "trainNumber": "06118", "departureDate": "2026-08-24", "departureTime": "11:55", "trainOperator": "Iryo", "costDividerMode": "divided_total"}, "economics": {"iva": 0, "comision": 2.01, "gastosAdm": 12.73, "adjustments": [], "baseNetCost": 0, "suplementos": 71.92, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 401.56}, "itemStatus": "confirmed", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "56bir218n", "type": "hotel", "details": {"date": "2026-09-01", "rooms": [{"id": "1", "type": "Doble Standard", "board": "Desayuno Buffet", "price": 0, "paxCount": 2}], "airline": "K+K Hotel Central", "checkIn": "2026-09-01", "checkOut": "2026-09-04", "classType": "Habitación Clásica Doble", "hotelName": "K+K Hotel Central, Hybernská 10, Prague (110 00), Prague, Czech Republic", "bookingCode": "3045985", "destination": "K+K Hotel Central, Hybernska 10, Nové Město, Prague 1, Nove Mesto (110 00), Nove Mesto, Republica Checa", "departureDate": "2026-09-01", "trainOperator": "K+K Hotel Central", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3045985"}, "economics": {"iva": 5.67, "comision": 59.8, "gastosAdm": 4.02, "adjustments": [], "baseNetCost": 469.73, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 460.04}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["c3b95aae-14b9-47fb-93a7-db2c5b497c73", "a2dd445b-56f3-4a4e-8cdb-e6c842ec1e0a"]}, {"id": "1787020128539", "type": "hotel", "details": {"date": "2026-09-01", "rooms": [{"id": "1", "type": "Doble Standard", "board": "Desayuno Buffet", "price": 0, "paxCount": 2}], "airline": "K+K Hotel Central", "checkIn": "2026-09-01", "checkOut": "2026-09-04", "classType": "Habitación Clásica Doble", "hotelName": "K+K Hotel Central, Hybernská 10, Prague (110 00), Prague, Czech Republic", "bookingCode": "3045985", "destination": "K+K Hotel Central, Hybernska 10, Nové Město, Prague 1, Nove Mesto (110 00), Nove Mesto, Republica Checa", "departureDate": "2026-09-01", "trainOperator": "K+K Hotel Central", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": ""}, "economics": {"iva": 5.59, "comision": 58.9, "gastosAdm": 3.96, "adjustments": [], "baseNetCost": 469.73, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 453.11}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["87a2ca8b-c509-457f-a40d-554e2667a490", "90ffa023-46f6-4675-863d-9bc64f81ba1b"]}, {"id": "1787020200301", "type": "hotel", "details": {"date": "2026-09-01", "rooms": [{"id": "1", "type": "Doble Standard", "board": "Desayuno Buffet", "price": 0, "paxCount": 2}], "airline": "K+K Hotel Central", "checkIn": "2026-09-01", "checkOut": "2026-09-04", "classType": "Habitación Clásica Doble", "hotelName": "K+K Hotel Central, Hybernská 10, Prague (110 00), Prague, Czech Republic", "bookingCode": "3045985", "destination": "K+K Hotel Central, Hybernska 10, Nové Město, Prague 1, Nove Mesto (110 00), Nove Mesto, Republica Checa", "departureDate": "2026-09-01", "trainOperator": "K+K Hotel Central", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": ""}, "economics": {"iva": 5.67, "comision": 59.8, "gastosAdm": 4.02, "adjustments": [], "baseNetCost": 469.73, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 459.99}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["c02436f5-fffe-40aa-8d78-fa6cda57df29", "9538c67c-5ae7-4d0d-a8c4-778049645bf5"]}, {"id": "u52lliu41", "type": "train", "details": {"date": "2026-09-04", "time": "10:36", "origin": "Praha-Holesovice", "airline": "ÖBB Personenverkehr AG", "checkIn": "2026-09-04", "classType": "2", "arrivalDate": "", "arrivalTime": "14:49", "bookingCode": "2303 0315 3843 4407", "description": "Sparschiene", "destination": "Wien Hbf (Bahnsteige 3-12)", "seatDetails": "", "trainNumber": "RJ 251", "departureDate": "2026-09-04", "departureTime": "10:36", "trainOperator": "ÖBB", "costDividerMode": "divided_total", "confirmationNumber": "2303 0315 3843 4407"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 38.1, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 360}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "gtmlz0teq", "type": "hotel", "details": {"date": "2026-09-04", "rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "airline": "ibis Wien Messe", "checkIn": "2026-09-04", "checkOut": "2026-09-07", "classType": "Standard Double Room, 1 Double Bed", "hotelName": "ibis Wien Messe, Lassallestrasse 7a, Vienna (1020), Vienna", "bookingCode": "3046088", "destination": "ibis Wien Messe, Lassallestrasse 7a, Vienna (1020), Vienna", "departureDate": "2026-09-04", "trainOperator": "ibis Wien Messe", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3046088"}, "economics": {"iva": 2.24, "comision": 34.79, "gastosAdm": 2.63, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [{"id": "2bq4m", "label": "Property Fee", "amount": 2.06}, {"id": "3xugo", "label": "Tax And Service Fee", "amount": 28.66}], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 267.63}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["c3b95aae-14b9-47fb-93a7-db2c5b497c73", "a2dd445b-56f3-4a4e-8cdb-e6c842ec1e0a"]}, {"id": "1787021655925", "type": "hotel", "details": {"date": "2026-09-04", "rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "airline": "ibis Wien Messe", "checkIn": "2026-09-04", "checkOut": "2026-09-07", "classType": "Standard Double Room, 1 Double Bed", "hotelName": "ibis Wien Messe, Lassallestrasse 7a, Vienna (1020), Vienna", "bookingCode": "3046088", "destination": "ibis Wien Messe, Lassallestrasse 7a, Vienna (1020), Vienna", "departureDate": "2026-09-04", "trainOperator": "ibis Wien Messe", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3046088"}, "economics": {"iva": 2.24, "comision": 34.79, "gastosAdm": 2.66, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [{"id": "2bq4m", "label": "Property Fee", "amount": 5.17}, {"id": "3xugo", "label": "Tax And Service Fee", "amount": 28.66}], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 267.63}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["90ffa023-46f6-4675-863d-9bc64f81ba1b", "87a2ca8b-c509-457f-a40d-554e2667a490"]}, {"id": "1787175285155", "type": "hotel", "details": {"date": "2026-09-04", "rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "airline": "ibis Wien Messe", "checkIn": "2026-09-04", "checkOut": "2026-09-07", "classType": "Standard Double Room, 1 Double Bed", "hotelName": "ibis Wien Messe, Lassallestrasse 7a, Vienna (1020), Vienna", "bookingCode": "3046088", "destination": "ibis Wien Messe, Lassallestrasse 7a, Vienna (1020), Vienna", "departureDate": "2026-09-04", "trainOperator": "ibis Wien Messe", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3046088"}, "economics": {"iva": 2.24, "comision": 34.79, "gastosAdm": 2.66, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [{"id": "2bq4m", "label": "Property Fee", "amount": 5.17}, {"id": "3xugo", "label": "Tax And Service Fee", "amount": 28.66}], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 267.63}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["9538c67c-5ae7-4d0d-a8c4-778049645bf5", "c02436f5-fffe-40aa-8d78-fa6cda57df29"]}, {"id": "x6bxw2xwh", "type": "train", "details": {"date": "2026-09-07", "time": "08:40", "origin": "WIEN HBF (BAHNSTEIGE 3-12)", "airline": "ÖBB Personenverkehr AG", "checkIn": "2026-09-07", "classType": "2", "arrivalDate": "", "arrivalTime": "11:29", "bookingCode": "2194 7406 5693 7548", "destination": "BUDAPEST-Keleti", "seatDetails": "", "trainNumber": "EC 141", "departureDate": "2026-09-07", "departureTime": "08:40", "trainOperator": "ÖBB", "costDividerMode": "divided_total", "confirmationNumber": "2194 7406 5693 7548"}, "economics": {"iva": 0, "comision": 0, "gastosAdm": 0, "adjustments": [], "baseNetCost": 19.2, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 190.79}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "4bqg72952", "type": "hotel", "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "checkIn": "2026-09-07", "checkOut": "2026-09-10", "hotelName": "Vagabond Broadway, Csanyi Utca 9, Budapest (1077), Budapest, Hungary", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3046108"}, "economics": {"iva": 3.25, "comision": 34.29, "gastosAdm": 2.3, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 263.78}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["c3b95aae-14b9-47fb-93a7-db2c5b497c73", "a2dd445b-56f3-4a4e-8cdb-e6c842ec1e0a"]}, {"id": "1787175394853", "type": "hotel", "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "checkIn": "2026-09-07", "checkOut": "2026-09-10", "hotelName": "Vagabond Broadway, Csanyi Utca 9, Budapest (1077), Budapest, Hungary", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3046108"}, "economics": {"iva": 3.25, "comision": 34.29, "gastosAdm": 2.3, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 263.78}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["90ffa023-46f6-4675-863d-9bc64f81ba1b", "87a2ca8b-c509-457f-a40d-554e2667a490"]}, {"id": "1787175463815", "type": "hotel", "details": {"rooms": [{"id": "1", "type": "Doble Standard", "board": "Solo Habitación", "price": 0, "paxCount": 2}], "checkIn": "2026-09-07", "checkOut": "2026-09-10", "hotelName": "Vagabond Broadway, Csanyi Utca 9, Budapest (1077), Budapest, Hungary", "costDividerMode": "divided_total", "cancellationDate": "", "confirmationNumber": "3046108"}, "economics": {"iva": 3.25, "comision": 34.29, "gastosAdm": 2.3, "adjustments": [], "baseNetCost": 0, "suplementos": 0, "pricingModel": "total", "commissionType": "percentage", "customExpenses": [], "passengerCount": 6, "commissionValue": 10, "totalComisionable": 263.78}, "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8", "assignedPassengerIds": ["9538c67c-5ae7-4d0d-a8c4-778049645bf5", "c02436f5-fffe-40aa-8d78-fa6cda57df29"]}]		921.12	700.00	CASTRO, ALFREDO LUIS	2026-08-24	2026-09-17	6	["a2dd445b-56f3-4a4e-8cdb-e6c842ec1e0a", "90ffa023-46f6-4675-863d-9bc64f81ba1b", "87a2ca8b-c509-457f-a40d-554e2667a490", "c02436f5-fffe-40aa-8d78-fa6cda57df29", "9538c67c-5ae7-4d0d-a8c4-778049645bf5"]	[{"id": "dlccd146m", "date": "2026-08-18", "amount": 2400, "method": "cash", "reference": "", "passengerId": "c02436f5-fffe-40aa-8d78-fa6cda57df29"}, {"id": "l5vnvthf6", "date": "2026-08-18", "amount": 2200, "method": "cash", "reference": "", "passengerId": "90ffa023-46f6-4675-863d-9bc64f81ba1b"}, {"id": "qeuny3nk2", "date": "2026-08-18", "amount": 318, "method": "cash", "reference": "", "passengerId": "c3b95aae-14b9-47fb-93a7-db2c5b497c73"}, {"id": "8lsu8pogg", "date": "2026-09-15", "amount": 1625.37, "method": "transfer", "reference": ""}]	[{"id": "2jksh659g", "date": "2026-08-18", "amount": 383, "method": "transfer", "reference": "", "providerId": "2fe6de69-6f61-4206-841e-63f0f88f3ffc"}, {"id": "zusyo8zos", "date": "2026-08-18", "amount": 635.42, "method": "card", "reference": "", "providerId": "47e0556b-9e5f-48fd-bf60-6e246a315d0b"}, {"id": "uhea4x5bh", "date": "2026-08-18", "amount": 1363, "method": "transfer", "reference": "", "providerId": "6a54dea5-a3ba-40f9-8321-23ffb7f42380"}, {"id": "3s0hakt1u", "date": "2026-08-18", "amount": 2733, "method": "cash", "reference": "BACK", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "fdlbod7b6", "date": "2026-08-18", "amount": 490.02, "method": "cash", "reference": "", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}, {"id": "b1jicccn5", "date": "2026-08-18", "amount": 276.98, "method": "cash", "reference": "", "providerId": "9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8"}]	0.00		[]	\N
35e3457f-0e5f-4a98-9b7e-d95e09eed60a	6c0c3924-1495-4c5a-8959-707af1beb2c7	Viaje Cristina Europa		USD	draft	\N	\N	2026-08-21 10:21:35.536306	2026-09-14 21:58:14.557654	\N	[]	[]		\N	\N	Muna, Cristina			1	[]	[]	[]	0.00		[]	2026-09-14 21:58:14.557654
\.


--
-- Data for Name: operator; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operator (id, name, "defaultCommissionPercentage", "contactEmail", "contactPhone", "internalNotes", "createdAt", "updatedAt") FROM stdin;
32178821-a909-4457-8b82-8e6ca63679b0	Top Dest	13.00				2026-05-10 19:58:30.606882	2026-05-10 19:58:30.606882
9da3ac3c-5b2b-48e5-aeb2-d980ba3e7aa8	Juan Toselli	13.00				2026-05-10 19:58:41.160426	2026-05-10 19:58:41.160426
6a54dea5-a3ba-40f9-8321-23ffb7f42380	Free Way	13.00				2026-05-10 19:58:51.106596	2026-05-10 19:58:51.106596
6b579177-4fed-43f5-ba22-0f85ff4ae20b	Julia Tour	13.00				2026-05-10 19:58:59.475152	2026-05-10 19:58:59.475152
1cf8e6d2-152a-40b8-ac08-7d1dc512e220	Ricale	13.00				2026-05-10 19:59:07.313888	2026-05-10 19:59:07.313888
3e9de198-78b7-4b6b-a85e-d325dc31342c	Museo de River	0.00	\N	\N	\N	2026-06-16 19:26:56.842462	2026-06-16 19:26:56.842462
e3e3cf31-528c-44f3-8fce-7c8ebe773b12	River Escuela Benavidez	0.00				2026-06-16 19:28:17.092128	2026-06-18 22:02:25.242879
2fe6de69-6f61-4206-841e-63f0f88f3ffc	Action Travel	0.00	\N	\N	\N	2026-06-20 23:47:39.034429	2026-06-20 23:47:39.034429
f94c7379-545e-4310-80fd-382570f482dd	Traslado / Alejandro	0.00	\N	\N	\N	2026-06-21 20:50:27.279274	2026-06-21 20:50:27.279274
40ca4c87-05ba-4223-aed3-f5c16af45743	La Vie Suite Hotel Barrio Norte - Buenos Aires	0.00				2026-06-21 22:34:11.787487	2026-06-21 22:34:11.787487
47e0556b-9e5f-48fd-bf60-6e246a315d0b	RyanAir	0.00				2026-07-15 11:48:02.567666	2026-07-15 11:48:02.567666
\.


--
-- Data for Name: passenger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passenger (id, name, surname, email, whatsapp, notes, "createdAt", "updatedAt", "passportNumber", "birthDate", "passportExpiration", nationality) FROM stdin;
d199655a-80b3-4fe4-9184-76b0e0c7ae6e	Ana María	Martino	\N	\N	\N	2026-06-20 21:45:58.766929	2026-06-20 21:45:58.766929	\N	\N	\N	\N
65c27b12-13d6-4183-bcc6-695a18691a75	Jorge Carlos	Racchi	\N	\N	\N	2026-06-20 21:46:09.572251	2026-06-20 21:46:09.572251	\N	\N	\N	\N
ea17685b-c99f-4cdd-9095-c86e7397e6c1	Martin San	Juan	\N	\N	\N	2026-06-21 20:47:30.619675	2026-06-21 20:47:30.619675	\N	\N	\N	\N
9e348e4d-03e3-417f-8036-53fb225e8203	LUCIANA CECILIA	ABADIE	\N	\N	\N	2026-06-21 10:24:03.931028	2026-06-23 18:51:50.196477	\N	\N	\N	\N
bea185f0-f492-4809-a252-8bd9815a754d	OTERO	VALENTINA	\N	\N	\N	2026-07-17 16:45:57.888449	2026-07-17 16:45:57.888449	\N	\N	\N	\N
9e84636f-5716-479b-9884-91fb850e1e84	HORACIO MARCELO	MAYORGA SOMERVILLE	\N	\N	\N	2026-07-17 14:20:25.49199	2026-07-21 18:09:35.783769	AAN003254	06.05.1949	28.02.2036	ARGENTINA
c02436f5-fffe-40aa-8d78-fa6cda57df29	RAUL EDUARDO	RAHAL	\N	\N	\N	2026-06-24 16:38:02.677199	2026-07-21 18:10:17.219274	AAF583887	18 MAR/MAR 55	12 ABR/APR 28	ARGENTINA
9538c67c-5ae7-4d0d-a8c4-778049645bf5	MARIA DE LUJAN	BAZILLO	\N	\N	\N	2026-06-24 16:37:23.979427	2026-07-21 18:10:39.519021	AAF588430	21 JUN 60	16 ABR 28	ARGENTINA
a2dd445b-56f3-4a4e-8cdb-e6c842ec1e0a	MARIA LUISA	ARELLANO CARRERA	\N	\N	\N	2026-06-24 16:35:22.213243	2026-07-21 18:11:01.258108	D850675	25 Aug 1963	03 Nov 2035	URUGUAYA
c3b95aae-14b9-47fb-93a7-db2c5b497c73	ALFREDO LUIS	CASTRO	\N	\N	\N	2026-06-24 16:35:06.355738	2026-07-21 18:11:22.685966	AAH323448	29/05/1955	17/11/2031	ARGENTINA
90ffa023-46f6-4675-863d-9bc64f81ba1b	HORACIO ALEJANDRO	FERNANDEZ	\N	\N	\N	2026-06-24 16:33:57.589265	2026-07-21 18:13:34.147604	AAH101325	06/07/1962	10/09/2031	Argentina
87a2ca8b-c509-457f-a40d-554e2667a490	GRACIELA CELMIRA	ARELLANO	\N	\N	\N	2026-06-24 16:33:05.651294	2026-07-21 18:14:50.918747	AAM174244	26/10/1964	11/11/2035	ARGENTINA
9f036c09-6cd3-489f-a82b-1b1b1df4d2a1	ESMERALDA	ABADIE	\N	\N	\N	2026-06-21 10:24:07.984271	2026-07-21 18:15:06.612233	AAN163164	28/10/2013	16/04/2031	ARGENTINA
6c0c3924-1495-4c5a-8959-707af1beb2c7	Cristina	Muna		+5491158021538	\N	2026-08-03 17:44:40.308153	2026-08-03 17:44:40.308153		\N	\N	\N
88be8917-9d66-4162-b0ad-28aad8e3bdc8	VIRGINIA	ARANES	\N	\N	\N	2026-08-20 23:05:09.801866	2026-08-20 23:05:09.801866	27.071.498	03/04/1979	02/05/2027	ARGENTINA
dbe0f0e3-1c53-40bf-ada3-17375e2d4431	JUANA	DELGER ARANES	\N	\N	\N	2026-08-20 23:05:24.259873	2026-08-20 23:05:24.259873	50.235.301	14/04/2010	16/05/2039	ARGENTINA
8c3e743f-52ab-43f9-bb43-057957b9e9e8	JUAN JOSE	CARPELLO	\N	\N	\N	2026-08-21 10:22:20.097016	2026-08-21 10:22:20.097016	AAK202034	01/07/1934	01/07/2024	Argentina
e696a90a-b39f-481d-a9d6-ce14cc2ccb72	Buitre	Salva			\N	2026-08-21 10:35:53.797159	2026-08-21 10:35:53.797159		\N	\N	\N
56dd8bb6-44f0-4056-82cd-d43a537b0c2b	CRISTINA YOLANDA	ATASHIAN	\N	\N	\N	2026-08-21 10:21:56.281431	2026-08-21 14:22:28.239014	AAK202030	13/01/1954	01/01/2024	Argentina
6784de12-6f47-47d6-b584-54b9603cecb7	Juan	Otero			\N	2026-08-30 23:01:27.575289	2026-08-30 23:01:27.575289		\N	\N	\N
\.


--
-- Data for Name: payment_intent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_intent (id, "tenantId", amount, currency, status, "preferenceId", "mpPaymentId", "transactionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: quote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote (id, "originCity", destination, "travelersCount", "hotelCategory", "directFlights", "tripStyle", "isCentric", budget, "activitiesQuote", "roomDistribution", "accommodationType", "durationDays", "travelDates", "mealPlan", "aiResponse", "createdAt") FROM stdin;
\.


--
-- Data for Name: room_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_type (id, name, "mealPlan", "capacityAdults", "capacityChildren", description, "createdAt", "updatedAt", "hotelId") FROM stdin;
\.


--
-- Data for Name: sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale (id, "passengerName", "totalAmount", "paidAmount", currency, "paymentStatus", "travelDate", "internalNotes", "paymentHistory", "createdAt", "updatedAt", "quoteId") FROM stdin;
fdb77c46-7cd0-4912-9467-e090b4f8f4b4	Abadie, Luciana	4030.42	0.00	USD	pending	2026-07-19 21:00:00	\N	[]	2026-06-30 17:57:19.221247	2026-06-30 17:57:19.221247	8e0a776d-0e8b-457e-b064-af9e8ddb9448
67812939-ba70-4cc1-9482-277a4ca8f9aa	Martino, Ana María	4860.26	0.00	USD	pending	2026-07-06 21:00:00	\N	[]	2026-07-08 20:27:34.173081	2026-07-08 20:27:34.173081	84512984-7da9-405c-9822-9f78c8818739
436dc609-2eba-4c06-aa14-f09561453d2d	CASTRO, ALFREDO LUIS	921.12	0.00	USD	pending	2026-08-31 21:00:00	\N	[]	2026-07-15 11:50:37.729007	2026-07-15 11:50:37.729007	b53efbc7-ac18-44bc-9412-90a59c0d761a
d410161a-cca1-4149-9612-78b5e4002047	Horacio Mayorga	2969.32	0.00	USD	pending	2026-10-07 21:00:00	\N	[]	2026-07-17 15:54:49.276778	2026-07-17 15:54:49.276778	\N
\.


--
-- Data for Name: treasury_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treasury_account (id, name, currency, "initialBalance", "createdAt", "updatedAt") FROM stdin;
60c1ace9-d365-4501-8a09-8a49cacf0a9b	Mercado Pago	ARS	0.00	2026-06-30 10:42:08.20315	2026-06-30 10:42:08.20315
4894470f-e33a-4217-95f1-deaaaaf3dddc	Fondos Personales	USD	0.00	2026-07-16 18:27:36.732172	2026-07-16 18:27:36.732172
\.


--
-- Data for Name: treasury_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treasury_transaction (id, "accountId", type, category, amount, date, reference, "relatedEntityId", "relatedEntityType", "createdAt", "updatedAt", "tenantId", "paymentMethod", "bookingFileId", "invoiceId") FROM stdin;
\.


--
-- Data for Name: web_package; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.web_package (id, title, description, price, currency, duration, location, "isPublished", "webCategory", "imageUrl", tags, highlights, included, excluded, itinerary, notes, "createdAt", "updatedAt", "isPromo", "promoLabel", "originalPrice", "promoEndsAt", "isHeroBanner", "heroBannerText", subtitle, "sourceId", "customSections") FROM stdin;
\.


--
-- Name: agency_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agency_settings_id_seq', 1, true);


--
-- Name: destination_asset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destination_asset_id_seq', 37, true);


--
-- Name: invoice PK_15d25c200d9bcd8a33f698daf18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY (id);


--
-- Name: circuit PK_16d20c94e486b3613872aa43cad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.circuit
    ADD CONSTRAINT "PK_16d20c94e486b3613872aa43cad" PRIMARY KEY (id);


--
-- Name: hotel PK_3a62ac86b369b36c1a297e9ab26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT "PK_3a62ac86b369b36c1a297e9ab26" PRIMARY KEY (id);


--
-- Name: group_quote PK_3fb8a7448cf8541227283228a0b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_quote
    ADD CONSTRAINT "PK_3fb8a7448cf8541227283228a0b" PRIMARY KEY (id);


--
-- Name: group_departure PK_49de08441f08b7d0fb4347d5df9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_departure
    ADD CONSTRAINT "PK_49de08441f08b7d0fb4347d5df9" PRIMARY KEY (id);


--
-- Name: passenger PK_50e940dd2c126adc20205e83fac; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passenger
    ADD CONSTRAINT "PK_50e940dd2c126adc20205e83fac" PRIMARY KEY (id);


--
-- Name: flyer_doc PK_6261e047ba1bd3b799c89d289f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyer_doc
    ADD CONSTRAINT "PK_6261e047ba1bd3b799c89d289f0" PRIMARY KEY (id);


--
-- Name: web_package PK_6308e90f450089c9c253c68dfef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.web_package
    ADD CONSTRAINT "PK_6308e90f450089c9c253c68dfef" PRIMARY KEY (id);


--
-- Name: treasury_transaction PK_737c372a2fc6a7ceda522e23a93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasury_transaction
    ADD CONSTRAINT "PK_737c372a2fc6a7ceda522e23a93" PRIMARY KEY (id);


--
-- Name: destination_asset PK_76f4ff067b3afa217701b25c920; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_asset
    ADD CONSTRAINT "PK_76f4ff067b3afa217701b25c920" PRIMARY KEY (id);


--
-- Name: agency_settings PK_79e847923c31cd35b2ebaf40d6b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_settings
    ADD CONSTRAINT "PK_79e847923c31cd35b2ebaf40d6b" PRIMARY KEY (id);


--
-- Name: operator PK_8b950e1572745d9f69be7748ae8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operator
    ADD CONSTRAINT "PK_8b950e1572745d9f69be7748ae8" PRIMARY KEY (id);


--
-- Name: client PK_96da49381769303a6515a8785c7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY (id);


--
-- Name: room_type PK_abd0f8a4c8a444a84fa2b343353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_type
    ADD CONSTRAINT "PK_abd0f8a4c8a444a84fa2b343353" PRIMARY KEY (id);


--
-- Name: quote PK_b772d4cb09e587c8c72a78d2439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT "PK_b772d4cb09e587c8c72a78d2439" PRIMARY KEY (id);


--
-- Name: booking_file PK_bd9b8df69e0b7349f1357125649; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_file
    ADD CONSTRAINT "PK_bd9b8df69e0b7349f1357125649" PRIMARY KEY (id);


--
-- Name: sale PK_d03891c457cbcd22974732b5de2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY (id);


--
-- Name: treasury_account PK_da23f86295e99c4b8de03059259; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasury_account
    ADD CONSTRAINT "PK_da23f86295e99c4b8de03059259" PRIMARY KEY (id);


--
-- Name: payment_intent PK_dfca7a184ac4bccfccd817a13e4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intent
    ADD CONSTRAINT "PK_dfca7a184ac4bccfccd817a13e4" PRIMARY KEY (id);


--
-- Name: destination PK_e45b5ee5788eb3c7f0ae41746e7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination
    ADD CONSTRAINT "PK_e45b5ee5788eb3c7f0ae41746e7" PRIMARY KEY (id);


--
-- Name: manual_quote PK_ed742980bf05893def85fd2ff97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_quote
    ADD CONSTRAINT "PK_ed742980bf05893def85fd2ff97" PRIMARY KEY (id);


--
-- Name: payment_intent REL_28ae3a28c5244fd7f342ea337d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intent
    ADD CONSTRAINT "REL_28ae3a28c5244fd7f342ea337d" UNIQUE ("transactionId");


--
-- Name: sale REL_8196851c4b4256d5c8ae2548d6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT "REL_8196851c4b4256d5c8ae2548d6" UNIQUE ("quoteId");


--
-- Name: destination UQ_8a962921d15e2f4cfa8eba67482; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination
    ADD CONSTRAINT "UQ_8a962921d15e2f4cfa8eba67482" UNIQUE (name);


--
-- Name: flyer_doc UQ_9c1f6918b9d39f70fd44530fa98; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyer_doc
    ADD CONSTRAINT "UQ_9c1f6918b9d39f70fd44530fa98" UNIQUE ("contentHash");


--
-- Name: operator UQ_b383ed84b5891bd42be1d2eefd5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operator
    ADD CONSTRAINT "UQ_b383ed84b5891bd42be1d2eefd5" UNIQUE (name);


--
-- Name: experience experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experience
    ADD CONSTRAINT experience_pkey PRIMARY KEY (id);


--
-- Name: experience experience_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experience
    ADD CONSTRAINT experience_slug_key UNIQUE (slug);


--
-- Name: payment_intent FK_28ae3a28c5244fd7f342ea337d4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_intent
    ADD CONSTRAINT "FK_28ae3a28c5244fd7f342ea337d4" FOREIGN KEY ("transactionId") REFERENCES public.treasury_transaction(id);


--
-- Name: hotel FK_42db7ab71f573fa602496618f5e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel
    ADD CONSTRAINT "FK_42db7ab71f573fa602496618f5e" FOREIGN KEY ("destinationId") REFERENCES public.destination(id);


--
-- Name: invoice FK_5f7f684ae0c407f35d34a3d6ab5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "FK_5f7f684ae0c407f35d34a3d6ab5" FOREIGN KEY ("bookingFileId") REFERENCES public.booking_file(id);


--
-- Name: booking_file FK_62d1f048358eecddee5773eafed; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_file
    ADD CONSTRAINT "FK_62d1f048358eecddee5773eafed" FOREIGN KEY ("clientId") REFERENCES public.client(id);


--
-- Name: sale FK_8196851c4b4256d5c8ae2548d6e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT "FK_8196851c4b4256d5c8ae2548d6e" FOREIGN KEY ("quoteId") REFERENCES public.manual_quote(id) ON DELETE SET NULL;


--
-- Name: room_type FK_c3ab73f6a48e49d013972a7d939; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_type
    ADD CONSTRAINT "FK_c3ab73f6a48e49d013972a7d939" FOREIGN KEY ("hotelId") REFERENCES public.hotel(id) ON DELETE CASCADE;


--
-- Name: manual_quote FK_c90ac7aa076c9459659c0442cf0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.manual_quote
    ADD CONSTRAINT "FK_c90ac7aa076c9459659c0442cf0" FOREIGN KEY ("passengerId") REFERENCES public.passenger(id);


--
-- PostgreSQL database dump complete
--

\unrestrict JfEb38uTywXmsdR20YbROgzkuVgeQEUKsKMR9d0FwjK2ZO9h3Hsdu3TV02GM0Am

