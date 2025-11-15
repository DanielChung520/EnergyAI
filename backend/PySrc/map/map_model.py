from datetime import datetime

class Region:
    def __init__(self, id, name, name_en, division, bu, sort_no, continents):
        self.id = id
        self.name = name
        self.name_en = name_en
        self.division = division
        self.bu = bu
        self.sort_no = sort_no
        self.continents = continents

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_en': self.name_en,
            'division': self.division,
            'bu': self.bu,
            'sort_no': self.sort_no,
            'continents': self.continents
        }

    @staticmethod
    def from_dict(data):
        return Region(
            id=data.get('id'),
            name=data.get('name', ''),
            name_en=data.get('name_en', ''),
            division=data.get('division', ''),
            bu=data.get('bu', ''),
            sort_no=data.get('sort_no', 0),
            continents=data.get('continents', '')
        )

class Country:
    def __init__(self, id, abbrev, name, name_cn, region, continents, bu, division, flag, flag_url, bg_color):
        self.id = id
        self.abbrev = abbrev
        self.name = name
        self.name_cn = name_cn
        self.region = region
        self.continents = continents
        self.bu = bu
        self.division = division
        self.flag = flag
        self.flag_url = flag_url
        self.bg_color = bg_color

    def to_dict(self):
        return {
            'id': self.id,
            'abbrev': self.abbrev,
            'name': self.name,
            'name_cn': self.name_cn,
            'region': self.region,
            'continents': self.continents,
            'bu': self.bu,
            'division': self.division,
            'flag': self.flag,
            'flag_url': self.flag_url,
            'bg_color': self.bg_color
        }

    @staticmethod
    def from_dict(data):
        return Country(
            id=data.get('id'),
            abbrev=data.get('abbrev', ''),
            name=data.get('name', ''),
            name_cn=data.get('name_cn', ''),
            region=data.get('region', ''),
            continents=data.get('continents', ''),
            bu=data.get('bu', ''),
            division=data.get('division', ''),
            flag=data.get('flag', ''),
            flag_url=data.get('flag_url', ''),
            bg_color=data.get('bg_color', '')
        )

class MapRegion:
    def __init__(self, path_id, region_id, country, responsable, contact, coordinates, created_at=None, updated_at=None):
        self.path_id = path_id
        self.region_id = region_id
        self.country = country
        self.responsable = responsable
        self.contact = contact
        self.coordinates = coordinates if coordinates is not None else []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def to_dict(self):
        return {
            "path_id": self.path_id,
            "region_id": self.region_id,
            "country": self.country,
            "responsable": self.responsable,
            "contact": self.contact,
            "coordinates": self.coordinates,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        region = MapRegion(
            path_id=data.get('path_id'),
            region_id=data.get('region_id', ''),
            country=data.get('country', ''),
            responsable=data.get('responsable', ''),
            contact=data.get('contact', ''),
            coordinates=data.get('coordinates', [])
        )
        if 'created_at' in data:
            region.created_at = datetime.fromisoformat(data['created_at'])
        if 'updated_at' in data:
            region.updated_at = datetime.fromisoformat(data['updated_at'])
        return region 